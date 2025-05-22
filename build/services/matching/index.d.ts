import type { MatchingOptions, MatchingResult } from './types';
export declare class MatchingService {
    private openai;
    private model;
    private embeddingModel;
    private cache;
    private loadActivityQuestionnaire;
    private applyHardFilters;
    private calculateSoftPreferenceScore;
    constructor();
    matchUsers(options: MatchingOptions): Promise<MatchingResult>;
    private generateEmbeddings;
    private calculateSimilarities;
    private generateExplanations;
    private rankCandidates;
}
