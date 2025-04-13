
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { roundId } = await req.json();

    if (!roundId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: roundId' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the match round and activity information
    const { data: roundData, error: roundError } = await supabase
      .from('match_rounds')
      .select('*, activities(*)')
      .eq('id', roundId)
      .single();

    if (roundError || !roundData) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch match round', details: roundError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const activityId = roundData.activity_id;

    // Get all participants who have completed the questionnaire for this activity
    const { data: participants, error: participantsError } = await supabase
      .from('activity_participants')
      .select('*, profiles(*)')
      .eq('activity_id', activityId)
      .eq('status', 'completed');

    if (participantsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch participants', details: participantsError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Get the questionnaire for this activity
    const { data: questionnaire, error: questionnaireError } = await supabase
      .from('questionnaires')
      .select('*')
      .eq('activity_id', activityId)
      .single();

    if (questionnaireError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch questionnaire', details: questionnaireError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const matches = [];

    // Simple matching algorithm (in a real app this would be more sophisticated)
    if (participants.length >= 2) {
      const activityType = roundData.activities.activity_type;

      for (let i = 0; i < participants.length; i++) {
        for (let j = i + 1; j < participants.length; j++) {
          const participant1 = participants[i];
          const participant2 = participants[j];

          // Calculate a matching score based on answers
          const matchScore = calculateMatchScore(
            participant1.answers,
            participant2.answers,
            questionnaire.questions,
            activityType
          );

          // Generate match reason and icebreaker
          const { matchReason, icebreaker } = generateMatchInsights(
            participant1,
            participant2,
            matchScore,
            activityType
          );

          // Only create matches with a minimum score
          if (matchScore > 50) {
            matches.push({
              round_id: roundId,
              profile_id_1: participant1.profile_id,
              profile_id_2: participant2.profile_id,
              match_score: matchScore,
              match_reason: matchReason,
              icebreaker: icebreaker
            });
          }
        }
      }

      // Insert matches into the database
      if (matches.length > 0) {
        const { data: insertedMatches, error: insertError } = await supabase
          .from('matches')
          .insert(matches)
          .select();

        if (insertError) {
          return new Response(
            JSON.stringify({ error: 'Failed to insert matches', details: insertError }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }

        // Update round status to completed
        await supabase
          .from('match_rounds')
          .update({ status: 'completed' })
          .eq('id', roundId);

        return new Response(
          JSON.stringify({ success: true, matches: insertedMatches }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        return new Response(
          JSON.stringify({ success: true, message: 'No suitable matches found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ success: false, message: 'Not enough participants for matching' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Helper function to calculate match score based on questionnaire answers
function calculateMatchScore(
  answers1: any,
  answers2: any,
  questions: any,
  activityType: string
): number {
  // In a real app, this would be more sophisticated based on activity type
  let totalScore = 0;
  let maxPossibleScore = 0;

  // Parse questions if needed
  const parsedQuestions = typeof questions === 'string' ? JSON.parse(questions) : questions;

  // Compare answers for each question
  parsedQuestions.forEach((question: any) => {
    const q1Answer = answers1?.[question.id]?.answer;
    const q2Answer = answers2?.[question.id]?.answer;

    if (!q1Answer || !q2Answer) return;

    // Different scoring logic based on question type
    if (question.type === 'multiple_choice') {
      if (Array.isArray(q1Answer) && Array.isArray(q2Answer)) {
        // Count matching selections
        const intersection = q1Answer.filter(item => q2Answer.includes(item));
        const union = [...new Set([...q1Answer, ...q2Answer])];
        
        // Jaccard similarity
        const similarity = intersection.length / union.length;
        totalScore += similarity * 100;
        maxPossibleScore += 100;
      } else if (!Array.isArray(q1Answer) && !Array.isArray(q2Answer)) {
        // Single choice comparison
        if (q1Answer === q2Answer) {
          totalScore += 100;
        } else {
          totalScore += 0; // Different choices
        }
        maxPossibleScore += 100;
      }
    } else if (question.type === 'text') {
      // For text responses, we'd ideally use NLP techniques
      // Simple implementation: give partial score for any response
      totalScore += 50; // Assume 50% compatibility for text answers
      maxPossibleScore += 100;
    }
  });

  // Calculate final percentage score
  return maxPossibleScore > 0 ? Math.round(totalScore / maxPossibleScore * 100) : 60;
}

// Generate match reason and icebreaker based on profiles
function generateMatchInsights(participant1: any, participant2: any, score: number, activityType: string): { matchReason: string, icebreaker: string } {
  // In a real app, this would use AI to generate personalized insights
  
  const profile1 = participant1.profiles;
  const profile2 = participant2.profiles;
  
  let matchReason = '';
  let icebreaker = '';
  
  // Generate match reason based on activity type
  if (activityType === 'professional') {
    matchReason = `You both seem to have complementary professional interests and could benefit from networking together.`;
    icebreaker = `What recent professional development have you been most excited about?`;
  } else if (activityType === 'dating') {
    matchReason = `Based on your preferences, you might enjoy getting to know each other better.`;
    icebreaker = `What's your idea of a perfect weekend?`;
  } else if (activityType === 'hobby' || activityType === 'sports') {
    matchReason = `You share similar interests in activities and could enjoy doing them together.`;
    icebreaker = `What got you interested in this activity initially?`;
  } else {
    matchReason = `You have a ${score}% match based on your questionnaire responses.`;
    icebreaker = `What made you decide to join this event?`;
  }
  
  return { matchReason, icebreaker };
}
