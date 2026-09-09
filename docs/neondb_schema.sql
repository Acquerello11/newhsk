-- =============================================================================
-- Neon PostgreSQL Database Schema (Schema: public)
-- Project: HSK Mandarin Pronunciation Learning & Research Platform
-- Generated from Neon Console Structure
-- =============================================================================

-- Enable pgcrypto / uuid extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- Table 1: user_consents
-- Purpose: บันทึกความยินยอม PDPA และข้อตกลงการใช้งาน/การวิจัยของผู้เรียน
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_consents (
    user_id UUID PRIMARY KEY,
    terms_accepted BOOLEAN NOT NULL DEFAULT false,
    audio_consent BOOLEAN NOT NULL DEFAULT false,
    research_consent BOOLEAN NOT NULL DEFAULT false,
    consent_version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
    consented_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_consents_pkey PRIMARY KEY (user_id)
);

-- Indexes for user_consents
-- (user_consents_pkey is automatically created as UNIQUE BTREE on user_id)


-- =============================================================================
-- Table 2: phoneme_evaluations
-- Purpose: บันทึกผลการวิเคราะห์ระดับพยัญชนะ/สระ/วรรณยุกต์ (Phoneme Breakdown & GOP)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.phoneme_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    word_id VARCHAR(50) NOT NULL,
    pinyin VARCHAR(100) NOT NULL,
    phoneme VARCHAR(20) NOT NULL,
    phoneme_type VARCHAR(20) NOT NULL,
    gop NUMERIC(5, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    target VARCHAR(20) NOT NULL,
    recognized VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT phoneme_evaluations_pkey PRIMARY KEY (id)
);

-- Indexes for phoneme_evaluations
CREATE INDEX IF NOT EXISTS idx_phoneme_eval_phoneme 
    ON public.phoneme_evaluations USING BTREE (phoneme);

CREATE INDEX IF NOT EXISTS idx_phoneme_eval_user 
    ON public.phoneme_evaluations USING BTREE (user_id);


-- =============================================================================
-- Table 3: learning_events
-- Purpose: บันทึกพฤติกรรมการเรียนรู้และ xAPI Statements (IEEE 9274.1.1 Compliant)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.learning_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    verb VARCHAR(50) NOT NULL,
    lesson_id VARCHAR(50) NOT NULL,
    word VARCHAR(50) NOT NULL,
    target_tone INTEGER,
    detected_tone INTEGER,
    is_correct BOOLEAN NOT NULL,
    confidence DOUBLE PRECISION,
    xapi_statement JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT learning_events_pkey PRIMARY KEY (id)
);

-- Indexes for learning_events
CREATE INDEX IF NOT EXISTS idx_events_user_created 
    ON public.learning_events USING BTREE (user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_events_user_verb 
    ON public.learning_events USING BTREE (user_id, verb);

CREATE INDEX IF NOT EXISTS idx_events_word 
    ON public.learning_events USING BTREE (word);

CREATE INDEX IF NOT EXISTS idx_events_xapi_gin 
    ON public.learning_events USING GIN (xapi_statement);
