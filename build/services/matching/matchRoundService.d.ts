import type { MatchRound, ActivityParticipant } from '@/utils/supabaseTypes';
export declare class MatchRoundService {
    private matchingService;
    constructor();
    createMatchRound(activityId: string, name: string, scheduledTime: string): Promise<MatchRound>;
    getMatchRounds(activityId: string): Promise<MatchRound[]>;
    getParticipants(activityId: string): Promise<ActivityParticipant[]>;
    runMatchRound(roundId: string): Promise<void>;
    private generateIcebreaker;
}
