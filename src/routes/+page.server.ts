import { getDiagnosticAnalytics } from '$lib/server/db';
import { generateRemedialVocab, type RemedialCard } from '$lib/analytics/remedialEngine';
import { HSK1_VOCAB_PRESETS, HSK2_VOCAB_PRESETS, HSK3_VOCAB_PRESETS } from '$lib/vocabLoader';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const currentUserId = locals.user?.id ? String(locals.user.id) : 'usr_uuid_local';
	const queryUserIds = Array.from(
		new Set([currentUserId, '1', 'usr_uuid_local', 'usr_uuid_guest'].filter(Boolean))
	);

	try {
		const diagnostic = await getDiagnosticAnalytics(queryUserIds);
		const allVocab = [...HSK1_VOCAB_PRESETS, ...HSK2_VOCAB_PRESETS, ...HSK3_VOCAB_PRESETS];
		const remedialCards: RemedialCard[] = generateRemedialVocab(diagnostic, allVocab, 5);

		return {
			remedialCards
		};
	} catch (err) {
		console.warn('⚠️ [Page Load] Failed to get remedial cards for home page:', err);
		return {
			remedialCards: []
		};
	}
};
