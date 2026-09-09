// src/lib/server/neon.ts
import { neon } from '@neondatabase/serverless';
import { env } from '$env/dynamic/private';
import type { TargetPhonemeDetail } from '$lib/telemetry/adapter';

const NEON_URL =
	env.NEON_DATABASE_URL ||
	env.DATABASE_URL ||
	process.env.NEON_DATABASE_URL ||
	process.env.DATABASE_URL ||
	'postgresql://neondb_owner:npg_r0PXAKtfN6pU@ep-fragrant-union-azixkbg8-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

let isSchemaInitialized = false;

function getNeonClient() {
	return neon(NEON_URL);
}

/**
 * Initializes Neon schema for research phoneme evaluations and xAPI events.
 */
export async function initNeonSchema() {
	if (isSchemaInitialized) return;
	try {
		const sql = getNeonClient();

		// 1. Table for user consents (PDPA & Research Agreement)
		await sql`
			CREATE TABLE IF NOT EXISTS user_consents (
				user_id UUID PRIMARY KEY,
				terms_accepted BOOLEAN NOT NULL DEFAULT false,
				audio_consent BOOLEAN NOT NULL DEFAULT false,
				research_consent BOOLEAN NOT NULL DEFAULT false,
				consent_version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
				consented_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
			);
		`;

		// 2. Table for detailed phoneme breakdown (Phonetic Evaluation Analytics)
		await sql`
			CREATE TABLE IF NOT EXISTS phoneme_evaluations (
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
				created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
			);
		`;

		await sql`
			CREATE INDEX IF NOT EXISTS idx_phoneme_eval_phoneme ON phoneme_evaluations(phoneme);
		`;
		await sql`
			CREATE INDEX IF NOT EXISTS idx_phoneme_eval_user ON phoneme_evaluations(user_id);
		`;

		// 3. Table for learning events & xAPI statements (IEEE 9274.1.1)
		await sql`
			CREATE TABLE IF NOT EXISTS learning_events (
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
				created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
			);
		`;

		await sql`
			CREATE INDEX IF NOT EXISTS idx_events_user_created ON learning_events(user_id, created_at);
		`;
		await sql`
			CREATE INDEX IF NOT EXISTS idx_events_user_verb ON learning_events(user_id, verb);
		`;
		await sql`
			CREATE INDEX IF NOT EXISTS idx_events_word ON learning_events(word);
		`;
		await sql`
			CREATE INDEX IF NOT EXISTS idx_events_xapi_gin ON learning_events USING GIN(xapi_statement);
		`;

		isSchemaInitialized = true;
		console.log('✅ [Neon DB] Connected and verified all 3 tables in Neon PostgreSQL.');
	} catch (err) {
		console.warn('⚠️ [Neon DB Initialization Warning]:', err);
	}
}

/**
 * Archives granular phoneme breakdown records directly into Neon PostgreSQL for academic research.
 */
export async function recordPhonemesToNeon(params: {
	userId: string;
	wordId: string;
	pinyin: string;
	phonemeDetails: TargetPhonemeDetail[];
	xapiStatement?: any;
}) {
	try {
		await initNeonSchema();
		const sql = getNeonClient();

		if (params.phonemeDetails && params.phonemeDetails.length > 0) {
			for (const p of params.phonemeDetails) {
				// แบบที่ 3: กรองตัดพวกโค้ดที่เกิดจากบั๊กตัดพยางค์ทิ้ง
				if (p.phoneme.length > 5 || p.phoneme.startsWith('a') && p.phoneme.length > 3) {
					continue;
				}
				await sql`
					INSERT INTO phoneme_evaluations (
						user_id, word_id, pinyin, phoneme, phoneme_type, gop, status, target, recognized, created_at
					) VALUES (
						${params.userId},
						${params.wordId},
						${params.pinyin},
						${p.phoneme},
						${p.type},
						${p.gop},
						${p.status},
						${p.target},
						${p.recognized},
						CURRENT_TIMESTAMP
					);
				`;
			}
			console.log(`📡 [Neon DB Archive] Saved ${params.phonemeDetails.length} phoneme evaluation records to Neon.`);
		}
	} catch (err) {
		console.warn('⚠️ [Neon DB Phoneme Ingestion Warning - Non-fatal]:', err);
	}
}
