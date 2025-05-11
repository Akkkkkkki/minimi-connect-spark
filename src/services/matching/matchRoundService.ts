import { supabase } from '@/lib/supabaseClient';
import type { MatchRound, Activity, ActivityParticipant } from '@/utils/supabaseTypes';
import { MatchingService } from './index';

export class MatchRoundService {
  private matchingService: MatchingService;

  constructor() {
    this.matchingService = new MatchingService();
  }

  async createMatchRound(activityId: string, name: string, scheduledTime: string): Promise<MatchRound> {
    const { data, error } = await supabase
      .from('match_round')
      .insert({
        activity_id: parseInt(activityId),
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

  async getMatchRounds(activityId: string): Promise<MatchRound[]> {
    const { data, error } = await supabase
      .from('match_round')
      .select('*')
      .eq('activity_id', activityId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get match rounds: ${error.message}`);
    }

    return data || [];
  }

  async getParticipants(activityId: string): Promise<ActivityParticipant[]> {
    const { data, error } = await supabase
      .from('activity_participants')
      .select('*')
      .eq('activity_id', activityId)
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

      // Get all participants for this activity
      const participants = await this.getParticipants(matchRound.activity_id);
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

      // Get the questionnaire for this activity
      const { data: questionnaire, error: questionnaireError } = await supabase
        .from('activity_questionnaire')
        .select('*')
        .eq('activity_id', matchRound.activity_id)
        .single();

      if (questionnaireError) {
        throw new Error(`Failed to get questionnaire: ${questionnaireError.message}`);
      }

      // Run the matching algorithm
      const matchingResult = await this.matchingService.matchUsers({
        userId: participants[0].profile_id, // Use first participant as reference
        activityId: matchRound.activity_id,
        targetUsers: profiles.map(profile => ({
          userId: profile.id,
          name: profile.name,
          gender: profile.gender,
          birth_month: profile.birth_month,
          birth_year: profile.birth_year,
          interests: [], // TODO: Get from questionnaire answers
          preferences: [], // TODO: Get from questionnaire answers
          personalityTraits: [], // TODO: Get from questionnaire answers
          activities: [matchRound.activity_id],
          answers: {}, // TODO: Get from questionnaire answers
          hardFilters: [], // TODO: Get from questionnaire attributes
          softPreferences: [] // TODO: Get from questionnaire attributes
        })),
        questionnaire
      });

      // Store the matches in the database
      const matches = matchingResult.matches.map(match => ({
        round_id: roundId,
        profile_id_1: match.userId,
        profile_id_2: participants[0].profile_id, // Reference user
        match_score: match.score,
        match_reason: match.explanation,
        icebreaker: this.generateIcebreaker(match)
      }));

      await supabase.from('matches').insert(matches);

      // Update match round status
      await supabase
        .from('match_round')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', parseInt(roundId));

    } catch (error) {
      console.error('Matching round failed:', error);
      await supabase
        .from('match_round')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', parseInt(roundId));
      throw error;
    }
  }

  private generateIcebreaker(match: any): string {
    // TODO: Implement icebreaker generation using OpenAI
    return `Hi ${match.userId}, you and ${match.commonInterests.join(', ')} share common interests.`;
  }
}
