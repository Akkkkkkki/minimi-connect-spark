export const MATCHING_PROMPTS = {
    ANALYZE_PROFILE: `Analyze the following user profile and extract key characteristics:
  {profile}
  
  Return a JSON object with the following structure:
  {
    "interests": ["interest1", "interest2"],
    "personality_traits": ["trait1", "trait2"],
    "preferences": ["preference1", "preference2"]
  }`,
    GENERATE_EXPLANATION: `Based on the following user similarities:
  {similarities}
  
  Generate a clear explanation of why these users are a good match for the activity {activityId}. Focus on their shared interests and personality traits.`,
    RANK_CANDIDATES: `Rank the following candidate users for the activity {activityId} based on their compatibility with the main user {userId}:
  {candidates}
  
  Return a ranked list with scores from 0-100, where 100 is the best match.`,
};
export const DEFAULT_CONFIG = {
    MODEL: 'gpt-4',
    TEMPERATURE: 0.7,
    MAX_RESULTS: 10,
    SIMILARITY_THRESHOLD: 0.7,
};
