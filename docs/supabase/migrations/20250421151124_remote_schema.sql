create table "public"."activity_feedback" (
    "id" bigint generated always as identity not null,
    "activity_id" bigint not null,
    "profile_id" uuid not null,
    "rating" integer not null,
    "comment" text,
    "created_at" timestamp with time zone not null default now()
);


create table "public"."activity_tag" (
    "activity_id" bigint not null,
    "tag_id" bigint not null
);


create table "public"."chat_message" (
    "id" bigint generated always as identity not null,
    "match_id" bigint not null,
    "sender_id" uuid not null,
    "body" text not null,
    "created_at" timestamp with time zone not null default now()
);


create table "public"."questionnaire_response" (
    "id" bigint generated always as identity not null,
    "participant_id" bigint not null,
    "questionnaire_id" bigint not null,
    "answers" jsonb not null default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now()
);


create table "public"."tag" (
    "id" bigint generated always as identity not null,
    "name" text not null
);


CREATE UNIQUE INDEX activity_feedback_pkey ON public.activity_feedback USING btree (id);

CREATE UNIQUE INDEX activity_tag_pkey ON public.activity_tag USING btree (activity_id, tag_id);

CREATE UNIQUE INDEX chat_message_pkey ON public.chat_message USING btree (id);

CREATE UNIQUE INDEX questionnaire_response_pkey ON public.questionnaire_response USING btree (id);

CREATE UNIQUE INDEX tag_name_key ON public.tag USING btree (name);

CREATE UNIQUE INDEX tag_pkey ON public.tag USING btree (id);

CREATE UNIQUE INDEX uniq_round_per_activity ON public.match_round USING btree (activity_id, name);

alter table "public"."activity_feedback" add constraint "activity_feedback_pkey" PRIMARY KEY using index "activity_feedback_pkey";

alter table "public"."activity_tag" add constraint "activity_tag_pkey" PRIMARY KEY using index "activity_tag_pkey";

alter table "public"."chat_message" add constraint "chat_message_pkey" PRIMARY KEY using index "chat_message_pkey";

alter table "public"."questionnaire_response" add constraint "questionnaire_response_pkey" PRIMARY KEY using index "questionnaire_response_pkey";

alter table "public"."tag" add constraint "tag_pkey" PRIMARY KEY using index "tag_pkey";

alter table "public"."activity_feedback" add constraint "activity_feedback_activity_id_fkey" FOREIGN KEY (activity_id) REFERENCES activity(id) ON DELETE CASCADE not valid;

alter table "public"."activity_feedback" validate constraint "activity_feedback_activity_id_fkey";

alter table "public"."activity_feedback" add constraint "activity_feedback_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES profile(id) not valid;

alter table "public"."activity_feedback" validate constraint "activity_feedback_profile_id_fkey";

alter table "public"."activity_feedback" add constraint "activity_feedback_rating_check" CHECK (((rating >= 1) AND (rating <= 5))) not valid;

alter table "public"."activity_feedback" validate constraint "activity_feedback_rating_check";

alter table "public"."activity_tag" add constraint "activity_tag_activity_id_fkey" FOREIGN KEY (activity_id) REFERENCES activity(id) ON DELETE CASCADE not valid;

alter table "public"."activity_tag" validate constraint "activity_tag_activity_id_fkey";

alter table "public"."activity_tag" add constraint "activity_tag_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES tag(id) ON DELETE CASCADE not valid;

alter table "public"."activity_tag" validate constraint "activity_tag_tag_id_fkey";

alter table "public"."chat_message" add constraint "chat_message_match_id_fkey" FOREIGN KEY (match_id) REFERENCES match(id) ON DELETE CASCADE not valid;

alter table "public"."chat_message" validate constraint "chat_message_match_id_fkey";

alter table "public"."chat_message" add constraint "chat_message_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES profile(id) not valid;

alter table "public"."chat_message" validate constraint "chat_message_sender_id_fkey";

alter table "public"."match" add constraint "chk_match_score" CHECK (((match_score >= (0)::numeric) AND (match_score <= (1)::numeric))) not valid;

alter table "public"."match" validate constraint "chk_match_score";

alter table "public"."match_round" add constraint "uniq_round_per_activity" UNIQUE using index "uniq_round_per_activity";

alter table "public"."questionnaire_response" add constraint "questionnaire_response_participant_id_fkey" FOREIGN KEY (participant_id) REFERENCES activity_participant(id) ON DELETE CASCADE not valid;

alter table "public"."questionnaire_response" validate constraint "questionnaire_response_participant_id_fkey";

alter table "public"."questionnaire_response" add constraint "questionnaire_response_questionnaire_id_fkey" FOREIGN KEY (questionnaire_id) REFERENCES questionnaire(id) ON DELETE CASCADE not valid;

alter table "public"."questionnaire_response" validate constraint "questionnaire_response_questionnaire_id_fkey";

alter table "public"."tag" add constraint "tag_name_key" UNIQUE using index "tag_name_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profile (id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."activity_feedback" to "anon";

grant insert on table "public"."activity_feedback" to "anon";

grant references on table "public"."activity_feedback" to "anon";

grant select on table "public"."activity_feedback" to "anon";

grant trigger on table "public"."activity_feedback" to "anon";

grant truncate on table "public"."activity_feedback" to "anon";

grant update on table "public"."activity_feedback" to "anon";

grant delete on table "public"."activity_feedback" to "authenticated";

grant insert on table "public"."activity_feedback" to "authenticated";

grant references on table "public"."activity_feedback" to "authenticated";

grant select on table "public"."activity_feedback" to "authenticated";

grant trigger on table "public"."activity_feedback" to "authenticated";

grant truncate on table "public"."activity_feedback" to "authenticated";

grant update on table "public"."activity_feedback" to "authenticated";

grant delete on table "public"."activity_feedback" to "service_role";

grant insert on table "public"."activity_feedback" to "service_role";

grant references on table "public"."activity_feedback" to "service_role";

grant select on table "public"."activity_feedback" to "service_role";

grant trigger on table "public"."activity_feedback" to "service_role";

grant truncate on table "public"."activity_feedback" to "service_role";

grant update on table "public"."activity_feedback" to "service_role";

grant delete on table "public"."activity_tag" to "anon";

grant insert on table "public"."activity_tag" to "anon";

grant references on table "public"."activity_tag" to "anon";

grant select on table "public"."activity_tag" to "anon";

grant trigger on table "public"."activity_tag" to "anon";

grant truncate on table "public"."activity_tag" to "anon";

grant update on table "public"."activity_tag" to "anon";

grant delete on table "public"."activity_tag" to "authenticated";

grant insert on table "public"."activity_tag" to "authenticated";

grant references on table "public"."activity_tag" to "authenticated";

grant select on table "public"."activity_tag" to "authenticated";

grant trigger on table "public"."activity_tag" to "authenticated";

grant truncate on table "public"."activity_tag" to "authenticated";

grant update on table "public"."activity_tag" to "authenticated";

grant delete on table "public"."activity_tag" to "service_role";

grant insert on table "public"."activity_tag" to "service_role";

grant references on table "public"."activity_tag" to "service_role";

grant select on table "public"."activity_tag" to "service_role";

grant trigger on table "public"."activity_tag" to "service_role";

grant truncate on table "public"."activity_tag" to "service_role";

grant update on table "public"."activity_tag" to "service_role";

grant delete on table "public"."chat_message" to "anon";

grant insert on table "public"."chat_message" to "anon";

grant references on table "public"."chat_message" to "anon";

grant select on table "public"."chat_message" to "anon";

grant trigger on table "public"."chat_message" to "anon";

grant truncate on table "public"."chat_message" to "anon";

grant update on table "public"."chat_message" to "anon";

grant delete on table "public"."chat_message" to "authenticated";

grant insert on table "public"."chat_message" to "authenticated";

grant references on table "public"."chat_message" to "authenticated";

grant select on table "public"."chat_message" to "authenticated";

grant trigger on table "public"."chat_message" to "authenticated";

grant truncate on table "public"."chat_message" to "authenticated";

grant update on table "public"."chat_message" to "authenticated";

grant delete on table "public"."chat_message" to "service_role";

grant insert on table "public"."chat_message" to "service_role";

grant references on table "public"."chat_message" to "service_role";

grant select on table "public"."chat_message" to "service_role";

grant trigger on table "public"."chat_message" to "service_role";

grant truncate on table "public"."chat_message" to "service_role";

grant update on table "public"."chat_message" to "service_role";

grant delete on table "public"."questionnaire_response" to "anon";

grant insert on table "public"."questionnaire_response" to "anon";

grant references on table "public"."questionnaire_response" to "anon";

grant select on table "public"."questionnaire_response" to "anon";

grant trigger on table "public"."questionnaire_response" to "anon";

grant truncate on table "public"."questionnaire_response" to "anon";

grant update on table "public"."questionnaire_response" to "anon";

grant delete on table "public"."questionnaire_response" to "authenticated";

grant insert on table "public"."questionnaire_response" to "authenticated";

grant references on table "public"."questionnaire_response" to "authenticated";

grant select on table "public"."questionnaire_response" to "authenticated";

grant trigger on table "public"."questionnaire_response" to "authenticated";

grant truncate on table "public"."questionnaire_response" to "authenticated";

grant update on table "public"."questionnaire_response" to "authenticated";

grant delete on table "public"."questionnaire_response" to "service_role";

grant insert on table "public"."questionnaire_response" to "service_role";

grant references on table "public"."questionnaire_response" to "service_role";

grant select on table "public"."questionnaire_response" to "service_role";

grant trigger on table "public"."questionnaire_response" to "service_role";

grant truncate on table "public"."questionnaire_response" to "service_role";

grant update on table "public"."questionnaire_response" to "service_role";

grant delete on table "public"."tag" to "anon";

grant insert on table "public"."tag" to "anon";

grant references on table "public"."tag" to "anon";

grant select on table "public"."tag" to "anon";

grant trigger on table "public"."tag" to "anon";

grant truncate on table "public"."tag" to "anon";

grant update on table "public"."tag" to "anon";

grant delete on table "public"."tag" to "authenticated";

grant insert on table "public"."tag" to "authenticated";

grant references on table "public"."tag" to "authenticated";

grant select on table "public"."tag" to "authenticated";

grant trigger on table "public"."tag" to "authenticated";

grant truncate on table "public"."tag" to "authenticated";

grant update on table "public"."tag" to "authenticated";

grant delete on table "public"."tag" to "service_role";

grant insert on table "public"."tag" to "service_role";

grant references on table "public"."tag" to "service_role";

grant select on table "public"."tag" to "service_role";

grant trigger on table "public"."tag" to "service_role";

grant truncate on table "public"."tag" to "service_role";

grant update on table "public"."tag" to "service_role";

create policy "Users can create their own activity"
on "public"."activity"
as permissive
for insert
to public
with check ((creator_id = auth.uid()));


create policy "Users can delete their own activity"
on "public"."activity"
as permissive
for delete
to public
using ((creator_id = auth.uid()));


create policy "Users can update their own activity"
on "public"."activity"
as permissive
for update
to public
using ((creator_id = auth.uid()))
with check ((creator_id = auth.uid()));


create policy "Users can view their own activity"
on "public"."activity"
as permissive
for select
to public
using ((creator_id = auth.uid()));


create policy "Service role can manage all profiles"
on "public"."profile"
as permissive
for all
to service_role
using (true)
with check (true);


create policy "Users can update their own profile"
on "public"."profile"
as permissive
for update
to public
using ((auth.uid() = id));


create policy "Users can view their own profiles"
on "public"."profile"
as permissive
for select
to authenticated
using (true);



