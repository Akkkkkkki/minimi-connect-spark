import type { Match } from '@/utils/supabaseTypes';
export interface Vote {
    matchId: string;
    profileId: string;
    vote: 'up' | 'down';
}
export declare class VoteService {
    recordVote(vote: Vote): Promise<void>;
    private checkForMutualMatch;
    getMatchesForProfile(profileId: string): Promise<Match[]>;
    getMutualMatchesForProfile(profileId: string): Promise<Match[]>;
}
