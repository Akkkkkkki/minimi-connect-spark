import { supabase } from '@/lib/supabaseClient';
import type { Match } from '@/utils/supabaseTypes';

export interface Vote {
  matchId: string;
  profileId: string;
  vote: 'up' | 'down';
}

export class VoteService {
  async recordVote(vote: Vote): Promise<void> {
    try {
      // First get the match to determine which profile is profile1
      const { data: match, error: matchError } = await supabase
        .from('match')
        .select('*')
        .eq('id', parseInt(vote.matchId))
        .single();

      if (matchError) {
        throw new Error(`Failed to get match details: ${matchError.message}`);
      }

      if (!match) {
        throw new Error('Match not found');
      }

      // Update the match table directly
      const { error } = await supabase
        .from('match')
        .update({
          ...(vote.profileId === match.profile_id_1 ? { profile_1_vote: vote.vote } : { profile_2_vote: vote.vote }),
          last_vote_update: new Date().toISOString()
        })
        .eq('id', parseInt(vote.matchId));

      if (error) {
        throw new Error(`Failed to record vote: ${error.message}`);
      }

      // Check if this creates a mutual match
      const isMutualMatch = match.profile_1_vote === 'up' && match.profile_2_vote === 'up';
      if (isMutualMatch && !match.is_mutual_match) {
        await supabase
          .from('match')
          .update({ is_mutual_match: true })
          .eq('id', parseInt(vote.matchId));
      }
    } catch (error) {
      console.error('Vote recording failed:', error);
      throw error;
    }
  }

  private async checkForMutualMatch(vote: Vote): Promise<void> {
    // Get the match details
    const { data: match, error: matchError } = await supabase
      .from('match')
      .select('*')
      .eq('id', vote.matchId)
      .single();

    if (matchError) {
      throw new Error(`Failed to get match details: ${matchError.message}`);
    }

    // Get all votes for this match
    const { data: votes, error: votesError } = await supabase
      .from('match_votes')
      .select('*')
      .eq('match_id', vote.matchId);

    if (votesError) {
      throw new Error(`Failed to get votes: ${votesError.message}`);
    }

    // Check if both users have upvoted
    const profile1Votes = votes.filter(v => v.profile_id === match.profile_id_1);
    const profile2Votes = votes.filter(v => v.profile_id === match.profile_id_2);

    const hasMutualMatch = profile1Votes.some(v => v.vote_type === 'up') &&
                          profile2Votes.some(v => v.vote_type === 'up');

    if (hasMutualMatch) {
      // Record the mutual match
      await supabase
        .from('mutual_matches')
        .insert({
          match_id: vote.matchId,
          created_at: new Date().toISOString()
        });
    }
  }

  async getMatchesForProfile(profileId: string): Promise<Match[]> {
    const { data, error } = await supabase
      .from('match')
      .select('*')
      .or(`profile_id_1.eq.${profileId},profile_id_2.eq.${profileId}`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get matches: ${error.message}`);
    }

    return data || [];
  }

  async getMutualMatchesForProfile(profileId: string): Promise<Match[]> {
    const { data, error } = await supabase
      .from('match')
      .select('*')
      .eq('is_mutual_match', true)
      .or(`profile_id_1.eq.${profileId},profile_id_2.eq.${profileId}`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get mutual matches: ${error.message}`);
    }

    return data || [];
  }
}
