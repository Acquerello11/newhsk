import type { PageServerLoad } from './$types';
import { getDiagnosticAnalytics } from '$lib/server/db';
import { generateRemedialVocab, type RemedialCard, type DiagnosticSummary } from '$lib/analytics/remedialEngine';
import { HSK1_VOCAB_PRESETS } from '$lib/vocabLoader';
import { ALL_QUEST_STAGES, MAX_STAGES_PER_LEVEL, parseQuestChallenges } from '$lib/data/questLevels';
import { getStageOverrides } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	const stageOverrides = await getStageOverrides();
	const stages = ALL_QUEST_STAGES.filter((stage) => stage.stageIndex <= MAX_STAGES_PER_LEVEL).flatMap((stage) => {
		const override = stageOverrides[stage.id];
		if (override?.isActive === false) return [];
		const challenges = override?.contentJson
			? parseQuestChallenges(override.contentJson)
			: null;
		if (override?.contentJson && !challenges) {
			console.warn(`Ignoring invalid saved challenge content for ${stage.id}`);
		}
		return [{
			...stage,
			title: override?.title || stage.title,
			category: override?.category || stage.category,
			description: override?.description || stage.description,
			challenges: challenges ?? stage.challenges
		}];
	});
	const user = locals.user;
	if (!user) {
		return {
			stages,
			remedialCards: [] as RemedialCard[],
			diagnosticSummary: null as DiagnosticSummary
		};
	}

	try {
		const diag = await getDiagnosticAnalytics(String(user.id));
		if (!diag || !diag.hasData) {
			return {
				stages,
				remedialCards: [] as RemedialCard[],
				diagnosticSummary: null as DiagnosticSummary
			};
		}

		const diagnosticSummary: DiagnosticSummary = {
			hasData: diag.hasData,
			weakPhonemes: diag.weakPhonemes,
			weakTones: diag.weakTones
		};

		const remedialCards = generateRemedialVocab(diagnosticSummary, HSK1_VOCAB_PRESETS, 4);

		return {
			stages,
			remedialCards,
			diagnosticSummary
		};
	} catch (err) {
		console.warn('Failed to load remedial cards for home page:', err);
		return {
			stages,
			remedialCards: [] as RemedialCard[],
			diagnosticSummary: null as DiagnosticSummary
		};
	}
};
