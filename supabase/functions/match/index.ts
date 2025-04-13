
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { roundId } = await req.json();
    
    if (!roundId) {
      return new Response(
        JSON.stringify({ error: 'Round ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // 1. Get the match round details
    const { data: roundData, error: roundError } = await supabaseAdmin
      .from('match_rounds')
      .select('*, activities(*, activity_participants(*, profiles(*)))')
      .eq('id', roundId)
      .single();

    if (roundError || !roundData) {
      console.error('Error fetching round:', roundError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch match round' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // 2. Get all participants for the activity
    const participants = roundData.activities?.activity_participants || [];
    if (participants.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Not enough participants for matching' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // 3. Create matched pairs
    // This is a simple algorithm that can be replaced with something more sophisticated
    const matches = [];
    const matched = new Set();
    
    for (let i = 0; i < participants.length; i++) {
      if (matched.has(participants[i].profile_id)) continue;
      
      for (let j = i + 1; j < participants.length; j++) {
        if (matched.has(participants[j].profile_id)) continue;
        
        // Generate a match score (random for this example)
        const matchScore = Math.floor(Math.random() * 40) + 60; // 60-100
        
        // Generate match reason and icebreaker
        const matchReason = getMatchReason();
        const icebreaker = getIcebreaker();
        
        // Create the match record
        matches.push({
          round_id: roundId,
          profile_id_1: participants[i].profile_id,
          profile_id_2: participants[j].profile_id,
          match_score: matchScore,
          match_reason: matchReason,
          icebreaker: icebreaker
        });
        
        matched.add(participants[i].profile_id);
        matched.add(participants[j].profile_id);
        break;
      }
    }

    // 4. Insert matches into the database
    if (matches.length > 0) {
      const { error: matchError } = await supabaseAdmin
        .from('matches')
        .insert(matches);
      
      if (matchError) {
        console.error('Error creating matches:', matchError);
        return new Response(
          JSON.stringify({ error: 'Failed to create matches' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }

    // 5. Update the round status to completed
    const { error: updateError } = await supabaseAdmin
      .from('match_rounds')
      .update({ status: 'completed' })
      .eq('id', roundId);
    
    if (updateError) {
      console.error('Error updating round status:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update round status' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        matches_created: matches.length,
        participants_matched: matched.size
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in match function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Helper functions for generating match reasons and icebreakers
function getMatchReason() {
  const reasons = [
    "You both share similar interests and professional backgrounds.",
    "Your communication styles and interests appear highly compatible.",
    "You both value similar qualities in your connections.",
    "Your activity preferences and goals align well.",
    "You have complementary skills and experiences.",
    "You both expressed interest in similar topics and activities.",
    "Your questionnaire answers indicate potential for meaningful conversation.",
    "You both bring different but complementary perspectives."
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
}

function getIcebreaker() {
  const icebreakers = [
    "What's the most interesting thing you've learned recently?",
    "What's one hobby you've always wanted to try but haven't yet?",
    "What's your favorite way to spend a weekend?",
    "If you could have dinner with anyone, living or dead, who would it be?",
    "What's something unexpected on your bucket list?",
    "What's a book or movie that changed how you see the world?",
    "If you could live in any fictional world, which would you choose?",
    "What's your go-to comfort food?",
    "What's a skill you'd love to master in the future?"
  ];
  return icebreakers[Math.floor(Math.random() * icebreakers.length)];
}
