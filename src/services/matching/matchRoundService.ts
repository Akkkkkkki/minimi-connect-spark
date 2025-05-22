import { supabase } from '@/integrations/supabase/client';
import type { MatchRound, Event, EventParticipant } from '@/utils/supabaseTypes';
import { MatchingService } from './index';

export class MatchRoundService {
  private matchingService: MatchingService;

  constructor() {
    this.matchingService = new MatchingService();
  }

  async createMatchRound(eventId: string, name: string, scheduledTime: string): Promise<MatchRound> {
    const { data, error } = await supabase
      .from('match_round')
      .insert({
        event_id: parseInt(eventId),
        name,
        trigger_time: Math.floor(new Date(scheduledTime).getTime() / 1000),
        trigger_type: 'scheduled',
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create match round: ${error.message}`);
    }

    return data;
  }

  async getMatchRounds(eventId: string): Promise<MatchRound[]> {
    const { data, error } = await supabase
      .from('match_round')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get match rounds: ${error.message}`);
    }

    return data || [];
  }

  async getParticipants(eventId: string): Promise<EventParticipant[]> {
    const { data, error } = await supabase
      .from('event_participant')
      .select('*')
      .eq('event_id', eventId)
      .eq('status', 'completed');

    if (error) {
      throw new Error(`Failed to get participants: ${error.message}`);
    }

    return data || [];
  }

  async runMatchRound(roundId: string): Promise<void> {
    try {
      // Get the match round details
      const { data: matchRound, error: roundError } = await supabase
        .from('match_round')
        .select('*')
        .eq('id', roundId)
        .single();

      if (roundError) {
        throw new Error(`Failed to get match round: ${roundError.message}`);
      }

      if (matchRound.status !== 'pending') {
        throw new Error('Match round is not in pending state');
      }

      // Get all participants for this event
      const participants = await this.getParticipants(matchRound.event_id);
      if (participants.length < 2) {
        throw new Error('Not enough participants to run matching');
      }

      // Get their profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', participants.map(p => p.profile_id));

      if (profileError) {
        throw new Error(`Failed to get profiles: ${profileError.message}`);
      }

      // Get the questionnaire for this event
      const { data: questionnaire, error: questionnaireError } = await supabase
        .from('event_questionnaire')
        .select('*')
        .eq('event_id', matchRound.event_id)
        .single();

      if (questionnaireError) {
        throw new Error(`Failed to get questionnaire: ${questionnaireError.message}`);
      }

      // Run the matching algorithm
      const matchingResult = await this.matchingService.matchUsers({
        userId: participants[0].profile_id, // Use first participant as reference
        eventId: matchRound.event_id,
        targetUsers: profiles.map(profile => ({
          userId: profile.id,
          name: profile.name,
          gender: profile.gender,
          birth_month: profile.birth_month,
          birth_year: profile.birth_year,
          interests: profile.interests || [], // STUB: Replace with actual extraction from questionnaire answers
          preferences: profile.preferences || [], // STUB: Replace with actual extraction from questionnaire answers
          personalityTraits: profile.personalityTraits || [], // STUB: Replace with actual extraction from questionnaire answers
          activities: [matchRound.event_id],
          answers: profile.answers || {}, // STUB: Replace with actual extraction from questionnaire answers
          hardFilters: [], // STUB: Replace with actual extraction from questionnaire attributes
          softPreferences: [] // STUB: Replace with actual extraction from questionnaire attributes
        })),
        questionnaire
      });

      // Store the matches in the database
      const matches = matchingResult.matches.map(match => ({
        round_id: roundId,
        profile_id_1: match.userId,
        profile_id_2: participants[0].profile_id, // Reference user
        match_score: match.score,
        match_reason_1: null, // To be filled asynchronously
        match_reason_2: null, // To be filled asynchronously
        icebreaker_1: null, // To be filled asynchronously
        icebreaker_2: null // To be filled asynchronously
      }));

      await supabase.from('matches').insert(matches);

      // Update match round status
      await supabase
        .from('match_round')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', parseInt(roundId));

    } catch (error) {
      // Provide user-facing feedback (stub: replace with toast or notification system in UI context)
      // toast.error('Matching round failed. Please try again later.');
      console.error('Matching round failed:', error);
      await supabase
        .from('match_round')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', parseInt(roundId));
      throw error;
    }
  }

  private generateIcebreaker(match: any): string {
    // STUB: Simple icebreaker generation
    if (match.commonInterests && match.commonInterests.length > 0) {
      return `You both like ${match.commonInterests.join(', ')}!`;
    }
    return `Say hi and discover what you have in common!`;
  }
}
