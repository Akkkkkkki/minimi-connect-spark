
-- Create activities table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    activity_type TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create questionnaires table
CREATE TABLE IF NOT EXISTS public.questionnaires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    questions JSONB DEFAULT '[]' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create activity_participants table
CREATE TABLE IF NOT EXISTS public.activity_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES auth.users(id) NOT NULL,
    answers JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (activity_id, profile_id)
);

-- Create match_rounds table
CREATE TABLE IF NOT EXISTS public.match_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'scheduled' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create matches table
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    round_id UUID REFERENCES match_rounds(id) ON DELETE CASCADE NOT NULL,
    profile_id_1 UUID REFERENCES auth.users(id) NOT NULL,
    profile_id_2 UUID REFERENCES auth.users(id) NOT NULL,
    match_score NUMERIC NOT NULL,
    match_reason TEXT,
    icebreaker TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Match feedback table
CREATE TABLE IF NOT EXISTS public.match_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES auth.users(id) NOT NULL,
    is_positive BOOLEAN NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create or update Row Level Security policies
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_feedback ENABLE ROW LEVEL SECURITY;

-- Activities policies
DROP POLICY IF EXISTS "Users can view any activity" ON activities;
CREATE POLICY "Users can view any activity" ON activities
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own activities" ON activities;
CREATE POLICY "Users can create their own activities" ON activities
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Users can update their own activities" ON activities;
CREATE POLICY "Users can update their own activities" ON activities
    FOR UPDATE USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Users can delete their own activities" ON activities;
CREATE POLICY "Users can delete their own activities" ON activities
    FOR DELETE USING (auth.uid() = creator_id);

-- Questionnaires policies
DROP POLICY IF EXISTS "Users can view any questionnaire" ON questionnaires;
CREATE POLICY "Users can view any questionnaire" ON questionnaires
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Activity creators can insert questionnaires" ON questionnaires;
CREATE POLICY "Activity creators can insert questionnaires" ON questionnaires
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM activities
            WHERE activities.id = activity_id
            AND activities.creator_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Activity creators can update questionnaires" ON questionnaires;
CREATE POLICY "Activity creators can update questionnaires" ON questionnaires
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM activities
            WHERE activities.id = activity_id
            AND activities.creator_id = auth.uid()
        )
    );

-- Activity participants policies
DROP POLICY IF EXISTS "Users can see activity participants" ON activity_participants;
CREATE POLICY "Users can see activity participants" ON activity_participants
    FOR SELECT USING (
        profile_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM activities
            WHERE activities.id = activity_id
            AND activities.creator_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can join activities" ON activity_participants;
CREATE POLICY "Users can join activities" ON activity_participants
    FOR INSERT WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their participation" ON activity_participants;
CREATE POLICY "Users can update their participation" ON activity_participants
    FOR UPDATE USING (profile_id = auth.uid());

-- Match rounds policies
DROP POLICY IF EXISTS "Users can view match rounds" ON match_rounds;
CREATE POLICY "Users can view match rounds" ON match_rounds 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM activities
            WHERE activities.id = activity_id
            AND (
                activities.creator_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM activity_participants
                    WHERE activity_participants.activity_id = activity_id
                    AND activity_participants.profile_id = auth.uid()
                )
            )
        )
    );

DROP POLICY IF EXISTS "Activity creators can create match rounds" ON match_rounds;
CREATE POLICY "Activity creators can create match rounds" ON match_rounds
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM activities
            WHERE activities.id = activity_id
            AND activities.creator_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Activity creators can update match rounds" ON match_rounds;
CREATE POLICY "Activity creators can update match rounds" ON match_rounds
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM activities
            WHERE activities.id = activity_id
            AND activities.creator_id = auth.uid()
        )
    );

-- Matches policies
DROP POLICY IF EXISTS "Users can view their matches" ON matches;
CREATE POLICY "Users can view their matches" ON matches
    FOR SELECT USING (
        profile_id_1 = auth.uid() OR 
        profile_id_2 = auth.uid() OR
        EXISTS (
            SELECT 1 FROM match_rounds
            JOIN activities ON activities.id = match_rounds.activity_id
            WHERE match_rounds.id = round_id
            AND activities.creator_id = auth.uid()
        )
    );

-- Match feedback policies
DROP POLICY IF EXISTS "Users can provide feedback on their matches" ON match_feedback;
CREATE POLICY "Users can provide feedback on their matches" ON match_feedback
    FOR INSERT WITH CHECK (
        profile_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM matches
            WHERE matches.id = match_id
            AND (matches.profile_id_1 = auth.uid() OR matches.profile_id_2 = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can view their feedback" ON match_feedback;
CREATE POLICY "Users can view their feedback" ON match_feedback
    FOR SELECT USING (
        profile_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM matches
            JOIN match_rounds ON match_rounds.id = matches.round_id
            JOIN activities ON activities.id = match_rounds.activity_id
            WHERE matches.id = match_id
            AND activities.creator_id = auth.uid()
        )
    );
