
-- Insert mock activities (if none exist)
INSERT INTO public.activities (id, creator_id, title, description, location, start_time, activity_type, tags)
SELECT 
    gen_random_uuid(), 
    '00000000-0000-0000-0000-000000000000', -- replace with actual creator ID when testing
    'Speed Networking Event', 
    'Meet professionals from various industries and expand your network.', 
    'Downtown Conference Center', 
    now() + interval '7 days',
    'professional',
    ARRAY['networking', 'business', 'career']
WHERE NOT EXISTS (SELECT 1 FROM public.activities LIMIT 1);

-- Insert a mock questionnaire for the first activity
WITH first_activity AS (
    SELECT id FROM public.activities ORDER BY created_at LIMIT 1
)
INSERT INTO public.questionnaires (activity_id, title, description, questions)
SELECT 
    id,
    'Professional Networking Questionnaire',
    'Help us match you with relevant professionals based on your interests and goals.',
    '[
        {
            "id": "q1",
            "text": "What industry do you primarily work in?",
            "type": "multiple_choice",
            "options": ["Technology", "Finance", "Healthcare", "Education", "Entertainment", "Other"],
            "required": true
        },
        {
            "id": "q2",
            "text": "What are you hoping to gain from this networking event?",
            "type": "multiple_choice",
            "options": ["Job opportunities", "Industry insights", "Mentorship", "Partnerships", "Funding"],
            "required": true
        },
        {
            "id": "q3",
            "text": "Briefly describe your professional background.",
            "type": "text",
            "required": true
        }
    ]'::jsonb
FROM first_activity
WHERE NOT EXISTS (SELECT 1 FROM public.questionnaires LIMIT 1);
