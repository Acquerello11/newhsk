import { getDiagnosticAnalytics } from '$lib/server/db';
import { generateRemedialVocab } from '$lib/analytics/remedialEngine';
import { HSK1_VOCAB_PRESETS, HSK2_VOCAB_PRESETS, HSK3_VOCAB_PRESETS } from '$lib/vocabLoader';
import { createRemedialStage, type QuestStage } from '$lib/data/questLevels';
import type { TonePreset } from '$lib/pitch';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const stageId = params.stage;

	if (stageId === 'remedial') {
		const currentUserId = locals.user?.id ? String(locals.user.id) : 'usr_uuid_local';
		const queryUserIds = Array.from(
			new Set([currentUserId, '1', 'usr_uuid_local', 'usr_uuid_guest'].filter(Boolean))
		);

		const allVocab = [...HSK1_VOCAB_PRESETS, ...HSK2_VOCAB_PRESETS, ...HSK3_VOCAB_PRESETS];
		let matchedPresets: TonePreset[] = [];

		try {
			const diagnostic = await getDiagnosticAnalytics(queryUserIds);
			const remedialCards = generateRemedialVocab(diagnostic, allVocab, 5);

			if (remedialCards.length > 0) {
				matchedPresets = remedialCards
					.map((c) => allVocab.find((v) => v.hanzi === c.hanzi)!)
					.filter(Boolean);
			}
		} catch (err) {
			console.warn('⚠️ [Remedial Stage] Failed to load user diagnostics:', err);
		}

		// Fallback presets if no specific error records exist yet
		if (matchedPresets.length === 0) {
			const fallbackWords = ['老师', '知识', '你好', '水', '谢谢'];
			matchedPresets = fallbackWords
				.map((w) => allVocab.find((v) => v.hanzi === w)!)
				.filter(Boolean);
		}

		const remedialStage: QuestStage = createRemedialStage(matchedPresets);

		return {
			isRemedial: true,
			remedialStage
		};
	}

	return {
		isRemedial: false,
		remedialStage: null
	};
};
