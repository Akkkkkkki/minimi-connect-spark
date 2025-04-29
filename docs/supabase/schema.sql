

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  SET search_path = public; -- Specify the search path

  INSERT INTO public.profile (id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_audit_fields"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.create_time = NOW();
        NEW.update_time = NOW();
        NEW.create_user_id = auth.uid();
        NEW.update_user_id = auth.uid();
        NEW.version = 1;
    ELSIF TG_OP = 'UPDATE' THEN
        NEW.update_time = NOW();
        NEW.update_user_id = auth.uid();
        NEW.version = OLD.version + 1;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_audit_fields"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_profile"("user_id" "uuid", "first_name_val" "text", "last_name_val" "text", "gender_val" "text", "birth_month_val" integer, "birth_year_val" integer) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Check if user exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) THEN
    -- Update the profile
    UPDATE public.profile
    SET
      first_name = first_name_val,
      last_name = last_name_val,
      gender = gender_val,
      birth_month = birth_month_val,
      birth_year = birth_year_val,
      updated_at = NOW()
    WHERE id = user_id;
    
    -- If no rows were updated, it means the profile doesn't exist yet
    -- In this case, try to insert a new profile
    IF NOT FOUND THEN
      INSERT INTO public.profile (
        id,
        first_name,
        last_name,
        gender,
        birth_month,
        birth_year,
        created_at,
        updated_at
      ) VALUES (
        user_id,
        first_name_val,
        last_name_val,
        gender_val,
        birth_month_val,
        birth_year_val,
        NOW(),
        NOW()
      );
    END IF;
  ELSE
    RAISE EXCEPTION 'User with ID % not found', user_id;
  END IF;
END;
$$;


ALTER FUNCTION "public"."update_user_profile"("user_id" "uuid", "first_name_val" "text", "last_name_val" "text", "gender_val" "text", "birth_month_val" integer, "birth_year_val" integer) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."activity" (
    "id" bigint NOT NULL,
    "creator_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "location" "text" NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone,
    "activity_type" "text" NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "version" integer DEFAULT 1,
    "create_user_id" "uuid",
    "update_user_id" "uuid",
    "serial_number" bigint,
    "scope" "text" DEFAULT 'PUBLIC'::"text",
    "type" "text",
    "applicants_max_number" integer,
    "sponsor_id" "uuid",
    "mobile" "text",
    "social_media" "text",
    "mail" "text",
    "state" "text" DEFAULT 'UP'::"text",
    "images" "jsonb",
    "qrcode" "jsonb",
    "lang" "text",
    CONSTRAINT "chk_activity_times" CHECK ((("end_time" IS NULL) OR ("end_time" > "start_time")))
);

ALTER TABLE ONLY "public"."activity" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."activity" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."activity_feedback" (
    "id" bigint NOT NULL,
    "activity_id" bigint NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "rating" integer NOT NULL,
    "comment" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "activity_feedback_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."activity_feedback" OWNER TO "postgres";


ALTER TABLE "public"."activity_feedback" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."activity_feedback_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."activity" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."activity_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."activity_match_trigger_rule" (
    "id" bigint NOT NULL,
    "activity_id" bigint,
    "executed" smallint DEFAULT 0,
    "sorted" integer,
    "trigger_time" bigint NOT NULL,
    "trigger_type" "text",
    "version" integer DEFAULT 1,
    "create_time" timestamp with time zone DEFAULT "now"(),
    "create_user_id" "uuid",
    "update_time" timestamp with time zone DEFAULT "now"(),
    "update_user_id" "uuid",
    "deleted" smallint DEFAULT 0
);


ALTER TABLE "public"."activity_match_trigger_rule" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."activity_match_trigger_rule_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."activity_match_trigger_rule_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."activity_match_trigger_rule_id_seq" OWNED BY "public"."activity_match_trigger_rule"."id";



CREATE TABLE IF NOT EXISTS "public"."activity_participant" (
    "id" bigint NOT NULL,
    "activity_id" bigint NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "version" integer DEFAULT 1,
    "create_user_id" "uuid",
    "update_user_id" "uuid",
    "match_type" "text"
);


ALTER TABLE "public"."activity_participant" OWNER TO "postgres";


ALTER TABLE "public"."activity_participant" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."activity_participant_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."activity_tag" (
    "activity_id" bigint NOT NULL,
    "tag_id" bigint NOT NULL
);


ALTER TABLE "public"."activity_tag" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."attribute" (
    "id" bigint NOT NULL,
    "authority_scope" "jsonb",
    "category" "text",
    "category_fact" "text",
    "en_category_fact" "text",
    "code" "text" NOT NULL,
    "fact_template" "text",
    "en_fact_template" "text",
    "limit_scope" integer,
    "required" smallint,
    "section" "text",
    "en_section" "text",
    "section_weight" double precision,
    "sorted" integer,
    "source" "text",
    "tags" "jsonb",
    "title" "text",
    "en_title" "text",
    "weight" double precision,
    "version" integer DEFAULT 1,
    "create_time" timestamp with time zone DEFAULT "now"(),
    "create_user_id" "uuid",
    "update_time" timestamp with time zone DEFAULT "now"(),
    "update_user_id" "uuid",
    "deleted" smallint DEFAULT 0
);


ALTER TABLE "public"."attribute" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."attribute_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."attribute_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."attribute_id_seq" OWNED BY "public"."attribute"."id";



CREATE TABLE IF NOT EXISTS "public"."chat_message" (
    "id" bigint NOT NULL,
    "match_id" bigint NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "body" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."chat_message" OWNER TO "postgres";


ALTER TABLE "public"."chat_message" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."chat_message_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."im_guide" (
    "id" bigint NOT NULL,
    "title_code" "text",
    "dialogue_type" "text",
    "msg_type" "text",
    "title" "text",
    "content" "text",
    "sorted" integer,
    "version" integer DEFAULT 1,
    "create_time" timestamp with time zone DEFAULT "now"(),
    "create_user_id" "uuid",
    "update_time" timestamp with time zone DEFAULT "now"(),
    "update_user_id" "uuid",
    "deleted" smallint DEFAULT 0
);


ALTER TABLE "public"."im_guide" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."im_guide_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."im_guide_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."im_guide_id_seq" OWNED BY "public"."im_guide"."id";



CREATE TABLE IF NOT EXISTS "public"."match" (
    "id" bigint NOT NULL,
    "round_id" bigint NOT NULL,
    "profile_id_1" "uuid" NOT NULL,
    "profile_id_2" "uuid" NOT NULL,
    "match_score" numeric NOT NULL,
    "match_reason" "text",
    "icebreaker" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_match_score" CHECK ((("match_score" >= (0)::numeric) AND ("match_score" <= (1)::numeric)))
);


ALTER TABLE "public"."match" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."match_feedback" (
    "id" bigint NOT NULL,
    "match_id" bigint NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "is_positive" boolean NOT NULL,
    "reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."match_feedback" OWNER TO "postgres";


ALTER TABLE "public"."match_feedback" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."match_feedback_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."match" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."match_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."match_round" (
    "id" bigint NOT NULL,
    "activity_id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "scheduled_time" timestamp with time zone NOT NULL,
    "status" "text" DEFAULT 'scheduled'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."match_round" OWNER TO "postgres";


ALTER TABLE "public"."match_round" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."match_round_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."person_attribute" (
    "id" bigint NOT NULL,
    "attribute_code" "text",
    "attribute_id" bigint,
    "person_id" "uuid",
    "source" "text",
    "tags_value" "jsonb",
    "version" integer DEFAULT 1,
    "create_time" timestamp with time zone DEFAULT "now"(),
    "create_user_id" "uuid",
    "update_time" timestamp with time zone DEFAULT "now"(),
    "update_user_id" "uuid",
    "deleted" smallint DEFAULT 0
);


ALTER TABLE "public"."person_attribute" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."person_attribute_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."person_attribute_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."person_attribute_id_seq" OWNED BY "public"."person_attribute"."id";



CREATE TABLE IF NOT EXISTS "public"."person_attribute_memory" (
    "id" bigint NOT NULL,
    "access_tier" smallint,
    "ai_flag" smallint,
    "attribute_code" "text",
    "attribute_id" bigint,
    "attribute_value" "text",
    "favorite" smallint,
    "person_id" "uuid",
    "sorted" integer,
    "source" "text",
    "weight" double precision,
    "version" integer DEFAULT 1,
    "create_time" timestamp with time zone DEFAULT "now"(),
    "create_user_id" "uuid",
    "update_time" timestamp with time zone DEFAULT "now"(),
    "update_user_id" "uuid",
    "deleted" smallint DEFAULT 0
);


ALTER TABLE "public"."person_attribute_memory" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."person_attribute_memory_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."person_attribute_memory_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."person_attribute_memory_id_seq" OWNED BY "public"."person_attribute_memory"."id";



CREATE TABLE IF NOT EXISTS "public"."person_experience" (
    "id" bigint NOT NULL,
    "attribute_id" bigint,
    "in_service" smallint NOT NULL,
    "join_year" "text",
    "leave_year" "text",
    "open" smallint,
    "org" "text",
    "person_id" "uuid",
    "profession" "text",
    "remark" "text",
    "source" "text",
    "type" "text",
    "version" integer DEFAULT 1,
    "create_time" timestamp with time zone DEFAULT "now"(),
    "create_user_id" "uuid",
    "update_time" timestamp with time zone DEFAULT "now"(),
    "update_user_id" "uuid",
    "deleted" smallint DEFAULT 0
);


ALTER TABLE "public"."person_experience" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."person_experience_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."person_experience_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."person_experience_id_seq" OWNED BY "public"."person_experience"."id";



CREATE TABLE IF NOT EXISTS "public"."profile" (
    "id" "uuid" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "birth_month" integer,
    "birth_year" integer,
    "city" "text",
    "country" "text",
    "avatar_url" "text",
    "bio" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted" boolean DEFAULT false NOT NULL,
    "gender" "text",
    "version" integer DEFAULT 1,
    "create_user_id" "uuid",
    "update_user_id" "uuid"
);

ALTER TABLE ONLY "public"."profile" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."profile" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."questionnaire" (
    "id" bigint NOT NULL,
    "activity_id" bigint NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "questions" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."questionnaire" OWNER TO "postgres";


ALTER TABLE "public"."questionnaire" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."questionnaire_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."questionnaire_response" (
    "id" bigint NOT NULL,
    "participant_id" bigint NOT NULL,
    "questionnaire_id" bigint NOT NULL,
    "answers" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."questionnaire_response" OWNER TO "postgres";


ALTER TABLE "public"."questionnaire_response" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."questionnaire_response_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."tag" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL
);


ALTER TABLE "public"."tag" OWNER TO "postgres";


ALTER TABLE "public"."tag" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."tag_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."activity_match_trigger_rule" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."activity_match_trigger_rule_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."attribute" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."attribute_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."im_guide" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."im_guide_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."person_attribute" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."person_attribute_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."person_attribute_memory" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."person_attribute_memory_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."person_experience" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."person_experience_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."activity_feedback"
    ADD CONSTRAINT "activity_feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."activity_match_trigger_rule"
    ADD CONSTRAINT "activity_match_trigger_rule_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."activity_participant"
    ADD CONSTRAINT "activity_participant_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."activity_participant"
    ADD CONSTRAINT "activity_participants_activity_id_profile_id_key" UNIQUE ("activity_id", "profile_id");



ALTER TABLE ONLY "public"."activity"
    ADD CONSTRAINT "activity_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."activity_tag"
    ADD CONSTRAINT "activity_tag_pkey" PRIMARY KEY ("activity_id", "tag_id");



ALTER TABLE ONLY "public"."attribute"
    ADD CONSTRAINT "attribute_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chat_message"
    ADD CONSTRAINT "chat_message_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."im_guide"
    ADD CONSTRAINT "im_guide_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."match_feedback"
    ADD CONSTRAINT "match_feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."match"
    ADD CONSTRAINT "match_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."match_round"
    ADD CONSTRAINT "match_round_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."person_attribute_memory"
    ADD CONSTRAINT "person_attribute_memory_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."person_attribute"
    ADD CONSTRAINT "person_attribute_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."person_experience"
    ADD CONSTRAINT "person_experience_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."questionnaire"
    ADD CONSTRAINT "questionnaire_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."questionnaire_response"
    ADD CONSTRAINT "questionnaire_response_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tag"
    ADD CONSTRAINT "tag_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."tag"
    ADD CONSTRAINT "tag_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."match_round"
    ADD CONSTRAINT "uniq_round_per_activity" UNIQUE ("activity_id", "name");



CREATE INDEX "idx_activity_creator" ON "public"."activity" USING "btree" ("creator_id");



CREATE INDEX "idx_activity_match_trigger_activity_id" ON "public"."activity_match_trigger_rule" USING "btree" ("activity_id");



CREATE INDEX "idx_activity_start" ON "public"."activity" USING "btree" ("start_time");



CREATE INDEX "idx_activity_tags" ON "public"."activity" USING "gin" ("tags");



CREATE INDEX "idx_feedback_match" ON "public"."match_feedback" USING "btree" ("match_id");



CREATE INDEX "idx_feedback_prof" ON "public"."match_feedback" USING "btree" ("profile_id");



CREATE INDEX "idx_match_prof1" ON "public"."match" USING "btree" ("profile_id_1");



CREATE INDEX "idx_match_prof2" ON "public"."match" USING "btree" ("profile_id_2");



CREATE INDEX "idx_match_round" ON "public"."match" USING "btree" ("round_id");



CREATE INDEX "idx_participant_act" ON "public"."activity_participant" USING "btree" ("activity_id");



CREATE INDEX "idx_participant_prof" ON "public"."activity_participant" USING "btree" ("profile_id");



CREATE INDEX "idx_person_attribute_attribute_id" ON "public"."person_attribute" USING "btree" ("attribute_id");



CREATE INDEX "idx_person_attribute_memory_attribute_id" ON "public"."person_attribute_memory" USING "btree" ("attribute_id");



CREATE INDEX "idx_person_attribute_memory_person_id" ON "public"."person_attribute_memory" USING "btree" ("person_id");



CREATE INDEX "idx_person_attribute_person_id" ON "public"."person_attribute" USING "btree" ("person_id");



CREATE INDEX "idx_person_experience_person_id" ON "public"."person_experience" USING "btree" ("person_id");



CREATE INDEX "idx_questionnaire_act" ON "public"."questionnaire" USING "btree" ("activity_id");



CREATE INDEX "idx_questionnaire_qs" ON "public"."questionnaire" USING "gin" ("questions");



CREATE INDEX "idx_round_activity" ON "public"."match_round" USING "btree" ("activity_id");



CREATE INDEX "idx_round_time" ON "public"."match_round" USING "btree" ("scheduled_time");



CREATE OR REPLACE TRIGGER "set_audit_fields_trigger" BEFORE INSERT OR UPDATE ON "public"."activity" FOR EACH ROW EXECUTE FUNCTION "public"."set_audit_fields"();



CREATE OR REPLACE TRIGGER "set_audit_fields_trigger" BEFORE INSERT OR UPDATE ON "public"."activity_participant" FOR EACH ROW EXECUTE FUNCTION "public"."set_audit_fields"();



CREATE OR REPLACE TRIGGER "set_audit_fields_trigger" BEFORE INSERT OR UPDATE ON "public"."im_guide" FOR EACH ROW EXECUTE FUNCTION "public"."set_audit_fields"();



CREATE OR REPLACE TRIGGER "set_audit_fields_trigger" BEFORE INSERT OR UPDATE ON "public"."person_attribute_memory" FOR EACH ROW EXECUTE FUNCTION "public"."set_audit_fields"();



CREATE OR REPLACE TRIGGER "set_audit_fields_trigger" BEFORE INSERT OR UPDATE ON "public"."person_experience" FOR EACH ROW EXECUTE FUNCTION "public"."set_audit_fields"();



CREATE OR REPLACE TRIGGER "set_audit_fields_trigger" BEFORE INSERT OR UPDATE ON "public"."profile" FOR EACH ROW EXECUTE FUNCTION "public"."set_audit_fields"();



CREATE OR REPLACE TRIGGER "trigger_set_updated_at" BEFORE UPDATE ON "public"."activity" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_set_updated_at" BEFORE UPDATE ON "public"."activity_participant" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_set_updated_at" BEFORE UPDATE ON "public"."match" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_set_updated_at" BEFORE UPDATE ON "public"."match_feedback" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_set_updated_at" BEFORE UPDATE ON "public"."match_round" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_set_updated_at" BEFORE UPDATE ON "public"."profile" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_set_updated_at" BEFORE UPDATE ON "public"."questionnaire" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."activity"
    ADD CONSTRAINT "activities_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."activity"
    ADD CONSTRAINT "activity_create_user_id_fkey" FOREIGN KEY ("create_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."activity_feedback"
    ADD CONSTRAINT "activity_feedback_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "public"."activity"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."activity_feedback"
    ADD CONSTRAINT "activity_feedback_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id");



ALTER TABLE ONLY "public"."activity_match_trigger_rule"
    ADD CONSTRAINT "activity_match_trigger_rule_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "public"."activity"("id");



ALTER TABLE ONLY "public"."activity_match_trigger_rule"
    ADD CONSTRAINT "activity_match_trigger_rule_create_user_id_fkey" FOREIGN KEY ("create_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."activity_match_trigger_rule"
    ADD CONSTRAINT "activity_match_trigger_rule_update_user_id_fkey" FOREIGN KEY ("update_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."activity_participant"
    ADD CONSTRAINT "activity_participant_create_user_id_fkey" FOREIGN KEY ("create_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."activity_participant"
    ADD CONSTRAINT "activity_participant_update_user_id_fkey" FOREIGN KEY ("update_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."activity_participant"
    ADD CONSTRAINT "activity_participants_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "public"."activity"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."activity_participant"
    ADD CONSTRAINT "activity_participants_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."activity"
    ADD CONSTRAINT "activity_sponsor_id_fkey" FOREIGN KEY ("sponsor_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."activity_tag"
    ADD CONSTRAINT "activity_tag_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "public"."activity"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."activity_tag"
    ADD CONSTRAINT "activity_tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."activity"
    ADD CONSTRAINT "activity_update_user_id_fkey" FOREIGN KEY ("update_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."attribute"
    ADD CONSTRAINT "attribute_create_user_id_fkey" FOREIGN KEY ("create_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."attribute"
    ADD CONSTRAINT "attribute_update_user_id_fkey" FOREIGN KEY ("update_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."chat_message"
    ADD CONSTRAINT "chat_message_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."match"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_message"
    ADD CONSTRAINT "chat_message_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profile"("id");



ALTER TABLE ONLY "public"."im_guide"
    ADD CONSTRAINT "im_guide_create_user_id_fkey" FOREIGN KEY ("create_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."im_guide"
    ADD CONSTRAINT "im_guide_update_user_id_fkey" FOREIGN KEY ("update_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."match_feedback"
    ADD CONSTRAINT "match_feedback_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."match"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."match_feedback"
    ADD CONSTRAINT "match_feedback_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."match_round"
    ADD CONSTRAINT "match_rounds_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "public"."activity"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."match"
    ADD CONSTRAINT "matches_profile_id_1_fkey" FOREIGN KEY ("profile_id_1") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."match"
    ADD CONSTRAINT "matches_profile_id_2_fkey" FOREIGN KEY ("profile_id_2") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."match"
    ADD CONSTRAINT "matches_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "public"."match_round"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."person_attribute"
    ADD CONSTRAINT "person_attribute_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "public"."attribute"("id");



ALTER TABLE ONLY "public"."person_attribute"
    ADD CONSTRAINT "person_attribute_create_user_id_fkey" FOREIGN KEY ("create_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."person_attribute_memory"
    ADD CONSTRAINT "person_attribute_memory_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "public"."attribute"("id");



ALTER TABLE ONLY "public"."person_attribute_memory"
    ADD CONSTRAINT "person_attribute_memory_create_user_id_fkey" FOREIGN KEY ("create_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."person_attribute_memory"
    ADD CONSTRAINT "person_attribute_memory_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."person_attribute_memory"
    ADD CONSTRAINT "person_attribute_memory_update_user_id_fkey" FOREIGN KEY ("update_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."person_attribute"
    ADD CONSTRAINT "person_attribute_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."person_attribute"
    ADD CONSTRAINT "person_attribute_update_user_id_fkey" FOREIGN KEY ("update_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."person_experience"
    ADD CONSTRAINT "person_experience_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "public"."attribute"("id");



ALTER TABLE ONLY "public"."person_experience"
    ADD CONSTRAINT "person_experience_create_user_id_fkey" FOREIGN KEY ("create_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."person_experience"
    ADD CONSTRAINT "person_experience_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."person_experience"
    ADD CONSTRAINT "person_experience_update_user_id_fkey" FOREIGN KEY ("update_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_create_user_id_fkey" FOREIGN KEY ("create_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_update_user_id_fkey" FOREIGN KEY ("update_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaire_response"
    ADD CONSTRAINT "questionnaire_response_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "public"."activity_participant"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaire_response"
    ADD CONSTRAINT "questionnaire_response_questionnaire_id_fkey" FOREIGN KEY ("questionnaire_id") REFERENCES "public"."questionnaire"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questionnaire"
    ADD CONSTRAINT "questionnaires_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "public"."activity"("id") ON DELETE CASCADE;



CREATE POLICY "Activity creators can create match rounds" ON "public"."match_round" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."activity"
  WHERE (("activity"."id" = "match_round"."activity_id") AND ("activity"."creator_id" = "auth"."uid"())))));



CREATE POLICY "Activity creators can insert questionnaires" ON "public"."questionnaire" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."activity"
  WHERE (("activity"."id" = "questionnaire"."activity_id") AND ("activity"."creator_id" = "auth"."uid"())))));



CREATE POLICY "Activity creators can update match rounds" ON "public"."match_round" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."activity"
  WHERE (("activity"."id" = "match_round"."activity_id") AND ("activity"."creator_id" = "auth"."uid"())))));



CREATE POLICY "Activity creators can update questionnaires" ON "public"."questionnaire" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."activity"
  WHERE (("activity"."id" = "questionnaire"."activity_id") AND ("activity"."creator_id" = "auth"."uid"())))));



CREATE POLICY "Delete AT by owner" ON "public"."activity_tag" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."activity" "a"
  WHERE (("a"."id" = "activity_tag"."activity_id") AND ("a"."creator_id" = "auth"."uid"())))));



CREATE POLICY "Insert AT by owner" ON "public"."activity_tag" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."activity" "a"
  WHERE (("a"."id" = "activity_tag"."activity_id") AND ("a"."creator_id" = "auth"."uid"())))));



CREATE POLICY "Insert chat" ON "public"."chat_message" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "sender_id") AND (EXISTS ( SELECT 1
   FROM "public"."match" "m"
  WHERE (("m"."id" = "chat_message"."match_id") AND (("m"."profile_id_1" = "auth"."uid"()) OR ("m"."profile_id_2" = "auth"."uid"())))))));



CREATE POLICY "Insert own AF" ON "public"."activity_feedback" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."activity_participant" "ap"
  WHERE (("ap"."activity_id" = "ap"."activity_id") AND ("ap"."profile_id" = "auth"."uid"())))));



CREATE POLICY "Insert own QR" ON "public"."questionnaire_response" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."activity_participant" "ap"
  WHERE (("ap"."id" = "questionnaire_response"."participant_id") AND ("ap"."profile_id" = "auth"."uid"())))));



CREATE POLICY "Service role can manage all profiles" ON "public"."profile" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role can manage profiles" ON "public"."profile" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Users can create their own activities" ON "public"."activity" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "creator_id"));



CREATE POLICY "Users can create their own activity" ON "public"."activity" FOR INSERT WITH CHECK (("creator_id" = "auth"."uid"()));



CREATE POLICY "Users can delete their own activities" ON "public"."activity" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "creator_id"));



CREATE POLICY "Users can delete their own activity" ON "public"."activity" FOR DELETE USING (("creator_id" = "auth"."uid"()));



CREATE POLICY "Users can insert their own attributes" ON "public"."person_attribute" FOR INSERT TO "authenticated" WITH CHECK (("person_id" = "auth"."uid"()));



CREATE POLICY "Users can join activities" ON "public"."activity_participant" FOR INSERT TO "authenticated" WITH CHECK (("profile_id" = "auth"."uid"()));



CREATE POLICY "Users can manage their own attribute memories" ON "public"."person_attribute_memory" TO "authenticated" USING (("person_id" = "auth"."uid"()));



CREATE POLICY "Users can manage their own experiences" ON "public"."person_experience" TO "authenticated" USING (("person_id" = "auth"."uid"()));



CREATE POLICY "Users can provide feedback on their matches" ON "public"."match_feedback" FOR INSERT TO "authenticated" WITH CHECK ((("profile_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."match"
  WHERE (("match"."id" = "match_feedback"."match_id") AND (("match"."profile_id_1" = "auth"."uid"()) OR ("match"."profile_id_2" = "auth"."uid"())))))));



CREATE POLICY "Users can see activity participants" ON "public"."activity_participant" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can update their own activities" ON "public"."activity" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "creator_id"));



CREATE POLICY "Users can update their own activity" ON "public"."activity" FOR UPDATE USING (("creator_id" = "auth"."uid"())) WITH CHECK (("creator_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own attributes" ON "public"."person_attribute" FOR UPDATE TO "authenticated" USING (("person_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own profile" ON "public"."profile" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their participation" ON "public"."activity_participant" FOR UPDATE TO "authenticated" USING (("profile_id" = "auth"."uid"()));



CREATE POLICY "Users can view IM guides" ON "public"."im_guide" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view any activity" ON "public"."activity" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view any questionnaire" ON "public"."questionnaire" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view match rounds" ON "public"."match_round" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."activity"
  WHERE (("activity"."id" = "match_round"."activity_id") AND (("activity"."creator_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
           FROM "public"."activity_participant"
          WHERE (("activity_participant"."activity_id" = "activity_participant"."activity_id") AND ("activity_participant"."profile_id" = "auth"."uid"())))))))));



CREATE POLICY "Users can view their feedback" ON "public"."match_feedback" FOR SELECT TO "authenticated" USING ((("profile_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM (("public"."match"
     JOIN "public"."match_round" ON (("match_round"."id" = "match"."round_id")))
     JOIN "public"."activity" ON (("activity"."id" = "match_round"."activity_id")))
  WHERE (("match"."id" = "match_feedback"."match_id") AND ("activity"."creator_id" = "auth"."uid"()))))));



CREATE POLICY "Users can view their matches" ON "public"."match" FOR SELECT TO "authenticated" USING ((("profile_id_1" = "auth"."uid"()) OR ("profile_id_2" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM ("public"."match_round"
     JOIN "public"."activity" ON (("activity"."id" = "match_round"."activity_id")))
  WHERE (("match_round"."id" = "match"."round_id") AND ("activity"."creator_id" = "auth"."uid"()))))));



CREATE POLICY "Users can view their own activity" ON "public"."activity" FOR SELECT USING (("creator_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own attributes" ON "public"."person_attribute" FOR SELECT TO "authenticated" USING (("person_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own profiles" ON "public"."profile" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."activity" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."activity_feedback" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."activity_match_trigger_rule" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."activity_participant" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."activity_tag" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."attribute" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chat_message" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."im_guide" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."match" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."match_feedback" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."match_round" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."person_attribute" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."person_attribute_memory" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."person_experience" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profile" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."questionnaire" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."questionnaire_response" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tag" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_audit_fields"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_audit_fields"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_audit_fields"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_profile"("user_id" "uuid", "first_name_val" "text", "last_name_val" "text", "gender_val" "text", "birth_month_val" integer, "birth_year_val" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_profile"("user_id" "uuid", "first_name_val" "text", "last_name_val" "text", "gender_val" "text", "birth_month_val" integer, "birth_year_val" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_profile"("user_id" "uuid", "first_name_val" "text", "last_name_val" "text", "gender_val" "text", "birth_month_val" integer, "birth_year_val" integer) TO "service_role";


















GRANT ALL ON TABLE "public"."activity" TO "anon";
GRANT ALL ON TABLE "public"."activity" TO "authenticated";
GRANT ALL ON TABLE "public"."activity" TO "service_role";



GRANT ALL ON TABLE "public"."activity_feedback" TO "anon";
GRANT ALL ON TABLE "public"."activity_feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_feedback" TO "service_role";



GRANT ALL ON SEQUENCE "public"."activity_feedback_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."activity_feedback_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."activity_feedback_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."activity_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."activity_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."activity_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."activity_match_trigger_rule" TO "anon";
GRANT ALL ON TABLE "public"."activity_match_trigger_rule" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_match_trigger_rule" TO "service_role";



GRANT ALL ON SEQUENCE "public"."activity_match_trigger_rule_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."activity_match_trigger_rule_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."activity_match_trigger_rule_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."activity_participant" TO "anon";
GRANT ALL ON TABLE "public"."activity_participant" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_participant" TO "service_role";



GRANT ALL ON SEQUENCE "public"."activity_participant_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."activity_participant_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."activity_participant_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."activity_tag" TO "anon";
GRANT ALL ON TABLE "public"."activity_tag" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_tag" TO "service_role";



GRANT ALL ON TABLE "public"."attribute" TO "anon";
GRANT ALL ON TABLE "public"."attribute" TO "authenticated";
GRANT ALL ON TABLE "public"."attribute" TO "service_role";



GRANT ALL ON SEQUENCE "public"."attribute_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."attribute_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."attribute_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."chat_message" TO "anon";
GRANT ALL ON TABLE "public"."chat_message" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_message" TO "service_role";



GRANT ALL ON SEQUENCE "public"."chat_message_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."chat_message_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."chat_message_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."im_guide" TO "anon";
GRANT ALL ON TABLE "public"."im_guide" TO "authenticated";
GRANT ALL ON TABLE "public"."im_guide" TO "service_role";



GRANT ALL ON SEQUENCE "public"."im_guide_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."im_guide_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."im_guide_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."match" TO "anon";
GRANT ALL ON TABLE "public"."match" TO "authenticated";
GRANT ALL ON TABLE "public"."match" TO "service_role";



GRANT ALL ON TABLE "public"."match_feedback" TO "anon";
GRANT ALL ON TABLE "public"."match_feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."match_feedback" TO "service_role";



GRANT ALL ON SEQUENCE "public"."match_feedback_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."match_feedback_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."match_feedback_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."match_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."match_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."match_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."match_round" TO "anon";
GRANT ALL ON TABLE "public"."match_round" TO "authenticated";
GRANT ALL ON TABLE "public"."match_round" TO "service_role";



GRANT ALL ON SEQUENCE "public"."match_round_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."match_round_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."match_round_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."person_attribute" TO "anon";
GRANT ALL ON TABLE "public"."person_attribute" TO "authenticated";
GRANT ALL ON TABLE "public"."person_attribute" TO "service_role";



GRANT ALL ON SEQUENCE "public"."person_attribute_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."person_attribute_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."person_attribute_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."person_attribute_memory" TO "anon";
GRANT ALL ON TABLE "public"."person_attribute_memory" TO "authenticated";
GRANT ALL ON TABLE "public"."person_attribute_memory" TO "service_role";



GRANT ALL ON SEQUENCE "public"."person_attribute_memory_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."person_attribute_memory_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."person_attribute_memory_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."person_experience" TO "anon";
GRANT ALL ON TABLE "public"."person_experience" TO "authenticated";
GRANT ALL ON TABLE "public"."person_experience" TO "service_role";



GRANT ALL ON SEQUENCE "public"."person_experience_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."person_experience_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."person_experience_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profile" TO "anon";
GRANT ALL ON TABLE "public"."profile" TO "authenticated";
GRANT ALL ON TABLE "public"."profile" TO "service_role";



GRANT ALL ON TABLE "public"."questionnaire" TO "anon";
GRANT ALL ON TABLE "public"."questionnaire" TO "authenticated";
GRANT ALL ON TABLE "public"."questionnaire" TO "service_role";



GRANT ALL ON SEQUENCE "public"."questionnaire_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."questionnaire_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."questionnaire_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."questionnaire_response" TO "anon";
GRANT ALL ON TABLE "public"."questionnaire_response" TO "authenticated";
GRANT ALL ON TABLE "public"."questionnaire_response" TO "service_role";



GRANT ALL ON SEQUENCE "public"."questionnaire_response_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."questionnaire_response_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."questionnaire_response_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."tag" TO "anon";
GRANT ALL ON TABLE "public"."tag" TO "authenticated";
GRANT ALL ON TABLE "public"."tag" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tag_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tag_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tag_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
