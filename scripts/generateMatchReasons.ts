import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
  timeout: Number(process.env.VITE_OPENAI_TIMEOUT) || 30000
});

const MODEL = process.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';
const TEMPERATURE = Number(process.env.VITE_OPENAI_TEMPERATURE) || 0.7;
const MAX_TOKENS = Number(process.env.VITE_OPENAI_MAX_TOKENS) || 256;

async function fetchMatchesNeedingReasons(batchSize = 10) {
  // Only process matches in completed rounds
  const { data: matches, error } = await supabase
    .from('match')
    .select(`
      id, round_id, profile_id_1, profile_id_2,
      match_reason_1, match_reason_2, icebreaker_1, icebreaker_2
    `)
    .or('match_reason_1.is.null,match_reason_2.is.null,icebreaker_1.is.null,icebreaker_2.is.null')
    .limit(batchSize);
  if (error) throw error;
  if (!matches) return [];

  // Filter to only those in completed rounds
  const roundIds = [...new Set(matches.map(m => m.round_id))];
  const { data: rounds, error: roundError } = await supabase
    .from('match_round')
    .select('id, status')
    .in('id', roundIds);
  if (roundError) throw roundError;
  const completedRoundIds = new Set((rounds || []).filter(r => r.status === 'completed').map(r => r.id));
  return matches.filter(m => completedRoundIds.has(m.round_id));
}

async function fetchProfile(profileId: string) {
  const { data, error } = await supabase
    .from('profile')
    .select('*')
    .eq('id', profileId)
    .single();
  if (error) throw error;
  return data;
}

async function fetchQuestionnaireAnswers(eventId: string, profileId: string) {
  // Find participant id
  const { data: participant, error: partError } = await supabase
    .from('event_participant')
    .select('id')
    .eq('event_id', eventId)
    .eq('profile_id', profileId)
    .single();
  if (partError || !participant) return null;
  // Get answers
  const { data: answers, error: ansError } = await supabase
    .from('questionnaire_response')
    .select('question_id, answers')
    .eq('participant_id', participant.id);
  if (ansError) return null;
  return answers;
}

function buildPrompt({ selfProfile, otherProfile, selfAnswers, otherAnswers, event }) {
  return `You are an expert matchmaker. Given the following two user profiles and their answers to the event questionnaire, write a short, friendly reason why the first user would be a good match for the second user in this event, and suggest a fun icebreaker for their first conversation.\n\nEvent: ${event.title}\n\nUser A (the one receiving this message):\n${JSON.stringify(selfProfile, null, 2)}\n\nTheir answers:\n${JSON.stringify(selfAnswers, null, 2)}\n\nUser B (their match):\n${JSON.stringify(otherProfile, null, 2)}\n\nTheir answers:\n${JSON.stringify(otherAnswers, null, 2)}\n\nRespond in JSON with keys 'reason' and 'icebreaker'.`;
}

async function generateReasonAndIcebreaker({ selfProfile, otherProfile, selfAnswers, otherAnswers, event }) {
  const prompt = buildPrompt({ selfProfile, otherProfile, selfAnswers, otherAnswers, event });
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: TEMPERATURE,
    max_tokens: MAX_TOKENS
  });
  const text = completion.choices[0].message.content;
  try {
    const json = JSON.parse(text!);
    return {
      reason: json.reason || '',
      icebreaker: json.icebreaker || ''
    };
  } catch (e) {
    // fallback: just return the text as reason
    return { reason: text || '', icebreaker: '' };
  }
}

async function fetchEvent(roundId: number) {
  const { data: round, error } = await supabase
    .from('match_round')
    .select('event_id, event:event_id (id, title)')
    .eq('id', roundId)
    .single();
  if (error) throw error;
  // round.event is either an object or an array; ensure we return the object
  if (Array.isArray(round.event)) {
    return round.event[0];
  }
  return round.event;
}

async function processMatch(match) {
  try {
    const event = await fetchEvent(match.round_id);
    const [profile1, profile2] = await Promise.all([
      fetchProfile(match.profile_id_1),
      fetchProfile(match.profile_id_2)
    ]);
    const [answers1, answers2] = await Promise.all([
      fetchQuestionnaireAnswers(event.id, match.profile_id_1),
      fetchQuestionnaireAnswers(event.id, match.profile_id_2)
    ]);
    // 1 -> 2
    let update: any = {};
    if (!match.match_reason_1 || !match.icebreaker_1) {
      const res = await generateReasonAndIcebreaker({
        selfProfile: profile1,
        otherProfile: profile2,
        selfAnswers: answers1,
        otherAnswers: answers2,
        event
      });
      update.match_reason_1 = res.reason;
      update.icebreaker_1 = res.icebreaker;
    }
    // 2 -> 1
    if (!match.match_reason_2 || !match.icebreaker_2) {
      const res = await generateReasonAndIcebreaker({
        selfProfile: profile2,
        otherProfile: profile1,
        selfAnswers: answers2,
        otherAnswers: answers1,
        event
      });
      update.match_reason_2 = res.reason;
      update.icebreaker_2 = res.icebreaker;
    }
    if (Object.keys(update).length > 0) {
      await supabase.from('match').update(update).eq('id', match.id);
      console.log(`Updated match ${match.id}`);
    }
  } catch (e) {
    console.error(`Failed to process match ${match.id}:`, e);
  }
}

async function main() {
  console.log('Starting match reason/icebreaker generation worker...');
  const matches = await fetchMatchesNeedingReasons(10);
  if (!matches.length) {
    console.log('No matches needing reasons/icebreakers.');
    return;
  }
  for (const match of matches) {
    await processMatch(match);
  }
  console.log('Done.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}); 