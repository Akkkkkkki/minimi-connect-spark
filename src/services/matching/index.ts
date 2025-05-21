import { OpenAI } from 'openai';
import type { MatchingOptions, MatchingResult, UserProfile, MatchResult, ActivityQuestionnaire, Candidate } from './types';
import { MATCHING_PROMPTS } from './constants';
import { supabase } from '@/integrations/supabase/client';

// Configuration from environment variables
const OPENAI_CONFIG = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  model: import.meta.env.VITE_OPENAI_MODEL,
  embeddingModel: import.meta.env.VITE_OPENAI_EMBEDDING_MODEL,
  temperature: parseFloat(import.meta.env.VITE_OPENAI_TEMPERATURE),
  maxTokens: parseInt(import.meta.env.VITE_OPENAI_MAX_TOKENS),
  timeout: parseInt(import.meta.env.VITE_OPENAI_TIMEOUT),
  maxRetries: parseInt(import.meta.env.VITE_OPENAI_MAX_RETRIES)
};

const MATCHING_CONFIG = {
  maxResults: parseInt(import.meta.env.VITE_MATCHING_MAX_RESULTS),
  similarityThreshold: parseFloat(import.meta.env.VITE_MATCHING_SIMILARITY_THRESHOLD),
  cacheEnabled: import.meta.env.VITE_MATCHING_CACHE_ENABLED === 'true'
};

export class MatchingService {
  private openai: OpenAI;
  private model: string;
  private embeddingModel: string;
  private cache: Map<string, number[]> = new Map();

  private async loadActivityQuestionnaire(activityId: string): Promise<ActivityQuestionnaire> {
    const { data: questionnaireData, error: questionnaireError } = await supabase
      .from('activity_questionnaire')
      .select('*')
      .eq('activity_id', activityId)
      .single();

    if (questionnaireError) {
      throw new Error(`Failed to load questionnaire: ${questionnaireError.message}`);
    }

    const { data: questionsData, error: questionsError } = await supabase
      .from('questionnaire_question')
      .select('*')
      .eq('questionnaire_id', questionnaireData.id)
      .order('order');

    if (questionsError) {
      throw new Error(`Failed to load questions: ${questionsError.message}`);
    }

    const { data: attributesData, error: attributesError } = await supabase
      .from('question_attributes')
      .select('*')
      .eq('questionnaire_id', questionnaireData.id);

    if (attributesError) {
      throw new Error(`Failed to load question attributes: ${attributesError.message}`);
    }

    return {
      id: questionnaireData.id,
      activityId: questionnaireData.activity_id,
      questions: questionsData,
      attributes: attributesData
    };
  }

  private async applyHardFilters(users: UserProfile[], questionnaire: ActivityQuestionnaire): Promise<UserProfile[]> {
    const hardFilterAttributes = questionnaire.attributes.filter(attr => attr.type === 'hard_filter');
    
    return users.filter(user => {
      return hardFilterAttributes.every(attr => {
        // Check if user's answer satisfies the hard filter requirement
        const answer = user.answers[attr.questionId];
        if (attr.required && (!answer || answer === '')) {
          return false;
        }
        // Add more specific validation logic based on question type
        return true;
      });
    });
  }

  private async calculateSoftPreferenceScore(user1: UserProfile, user2: UserProfile, questionnaire: ActivityQuestionnaire): Promise<number> {
    const softPreferenceAttributes = questionnaire.attributes.filter(attr => attr.type === 'soft_preference');
    let totalScore = 0;
    let totalWeight = 0;

    for (const attr of softPreferenceAttributes) {
      const answer1 = user1.answers[attr.questionId];
      const answer2 = user2.answers[attr.questionId];
      
      if (answer1 && answer2) {
        // Calculate similarity based on question type
        let similarity = 0;
        if (attr.weight) {
          similarity *= attr.weight;
        }
        totalScore += similarity;
        totalWeight += attr.weight || 1;
      }
    }

    return totalScore / (totalWeight || 1);
  }

  constructor() {
    if (!OPENAI_CONFIG.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.openai = new OpenAI({
      apiKey: OPENAI_CONFIG.apiKey,
      baseURL: 'https://api.openai.com/v1',
      defaultHeaders: {
        'Content-Type': 'application/json'
      }
    });

    this.model = OPENAI_CONFIG.model;
    this.embeddingModel = OPENAI_CONFIG.embeddingModel;
  }

  async matchUsers(options: MatchingOptions): Promise<MatchingResult> {
    try {
      const { userId, activityId, targetUsers, questionnaire } = options;
      const mainUser = targetUsers.find(u => u.userId === userId);

      if (!mainUser) {
        throw new Error('Main user not found in target users');
      }

      // Apply hard filters first
      const filteredUsers = await this.applyHardFilters(targetUsers, questionnaire);

      // Generate embeddings for filtered users
      const userEmbeddings = await Promise.all(
        filteredUsers.map(user => this.generateEmbeddings(user))
      );

      // Calculate similarity scores
      const similarities = await this.calculateSimilarities(
        userEmbeddings[0], // Main user embedding
        userEmbeddings.slice(1) // Other users' embeddings
      );

      // Calculate soft preference scores
      const softScores = await Promise.all(
        filteredUsers.slice(1).map(user => 
          this.calculateSoftPreferenceScore(mainUser, user, questionnaire)
        )
      );

      // Combine similarity and soft preference scores
      const combinedScores = similarities.map((similarity, index) => {
        const softScore = softScores[index];
        return (similarity + softScore) / 2;
      });

      // Create candidate objects with scores
      const candidates: Candidate[] = combinedScores.map((score, index) => ({
        userId: filteredUsers[index + 1].userId,
        similarityScore: similarities[index],
        softPreferenceScore: softScores[index],
        combinedScore: score,
        index: index + 1,
        explanation: '',
        commonInterests: [],
        commonPreferences: [],
        hardFilterMatches: 0
      }));

      // Sort candidates by combined score
      const sortedCandidates = candidates
        .sort((a, b) => b.combinedScore - a.combinedScore)
        .slice(0, MATCHING_CONFIG.maxResults) as Candidate[];

      // Generate explanations for matches
      const explanations = await this.generateExplanations(
        mainUser,
        sortedCandidates.map(c => filteredUsers[c.index]),
        sortedCandidates.map(c => c.combinedScore)
      );

      // Rank candidates
      const rankedCandidates = await this.rankCandidates(
        mainUser,
        sortedCandidates.map(c => filteredUsers[c.index]),
        sortedCandidates.map(c => c.combinedScore)
      );

      return {
        success: true,
        matches: sortedCandidates.map(c => ({
          userId: c.userId,
          score: c.combinedScore,
          explanation: c.explanation,
          commonInterests: c.commonInterests,
          commonPreferences: c.commonPreferences,
          hardFilterMatches: c.hardFilterMatches,
          softPreferenceScore: c.softPreferenceScore
        })),
        explanations,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Matching failed:', error);
      throw new Error(`Matching failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateEmbeddings(user: UserProfile): Promise<number[]> {
    const profileText = `User ID: ${user.userId}\nName: ${user.name}\n` +
      `Interests: ${user.interests.join(', ')}\n` +
      `Preferences: ${user.preferences.join(', ')}\n` +
      `Personality Traits: ${user.personalityTraits.join(', ')}\n`;

    // Check cache first
    const cacheKey = `${this.embeddingModel}:${profileText}`;
    if (MATCHING_CONFIG.cacheEnabled && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const response = await this.openai.embeddings.create({
        model: this.embeddingModel,
        input: profileText
      });

      const embedding = response.data[0].embedding;
      
      // Cache the result if caching is enabled
      if (MATCHING_CONFIG.cacheEnabled) {
        this.cache.set(cacheKey, embedding);
      }

      return embedding;
    } catch (error) {
      console.error('Embedding generation failed:', error);
      throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async calculateSimilarities(
    mainEmbedding: number[],
    otherEmbeddings: number[][]
  ): Promise<number[]> {
    // Using cosine similarity for embeddings
    return otherEmbeddings.map(embedding => {
      const dotProduct = mainEmbedding.reduce((sum, value, i) => 
        sum + (value * embedding[i]), 0);
      const magnitude1 = Math.sqrt(mainEmbedding.reduce((sum, value) => sum + value * value, 0));
      const magnitude2 = Math.sqrt(embedding.reduce((sum, value) => sum + value * value, 0));
      return dotProduct / (magnitude1 * magnitude2);
    });
  }

  private async generateExplanations(
    mainUser: UserProfile,
    otherUsers: UserProfile[],
    similarities: number[]
  ): Promise<string> {
    const prompt = MATCHING_PROMPTS.GENERATE_EXPLANATION.replace(
      '{similarities}',
      JSON.stringify({
        mainUser,
        otherUsers,
        similarities
      }, null, 2)
    );

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: OPENAI_CONFIG.temperature,
        max_tokens: OPENAI_CONFIG.maxTokens
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Explanation generation failed:', error);
      throw new Error(`Failed to generate explanation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async rankCandidates(
    mainUser: UserProfile,
    otherUsers: UserProfile[],
    similarities: number[]
  ): Promise<MatchResult[]> {
    const prompt = MATCHING_PROMPTS.RANK_CANDIDATES.replace(
      '{candidates}',
      JSON.stringify({
        mainUser,
        otherUsers,
        similarities
      }, null, 2)
    );

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: OPENAI_CONFIG.temperature,
        max_tokens: OPENAI_CONFIG.maxTokens
      });

      // Parse the response and create MatchResult objects
      const rankedUsers = JSON.parse(response.choices[0].message.content);
      return rankedUsers.map(user => ({
        userId: user.userId,
        score: user.score,
        explanation: user.explanation,
        commonInterests: user.commonInterests,
        commonPreferences: user.commonPreferences,
        hardFilterMatches: user.hardFilterMatches || 0,
        softPreferenceScore: user.softPreferenceScore || 0
      }));
    } catch (error) {
      console.error('Candidate ranking failed:', error);
      throw new Error(`Failed to rank candidates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
