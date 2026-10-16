<script lang="ts">
	import { Flame, Trophy, BookOpen, CheckCircle2, Sparkles, Target, Award, ArrowRight } from '@lucide/svelte';
	import { progress } from '$lib/progress.svelte';

	// Calculate words learned based on completed lessons / stars
	let completedLessonsCount = $derived(Object.keys(progress.completed || {}).length);
	let totalWordsLearned = $derived(completedLessonsCount * 5 + (progress.xp > 0 ? 3 : 0));
	let hskGoalWords = 150; // HSK 1 target words
	let wordProgressPercent = $derived(Math.min(100, Math.round((totalWordsLearned / hskGoalWords) * 100)));

	// Check if practiced today
	let todayStr = new Date().toISOString().slice(0, 10);
	let practicedToday = $derived(progress.lastPracticed === todayStr);

	// Generate past 7 days for consistency check
	const daysOfWeek = ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'];
	let weeklyActivity = $derived.by(() => {
		const result = [];
		const now = new Date();
		for (let i = 6; i >= 0; i--) {
			const d = new Date(now.getTime() - i * 86_400_000);
			const dateStr = d.toISOString().slice(0, 10);
			const dayName = daysOfWeek[(d.getDay() + 6) % 7]; // Mon = 0
			// If lastPracticed matches or within streak window
			const isDone = progress.lastPracticed === dateStr || (progress.streak > i && progress.lastPracticed);
			result.push({
				dayName,
				dateStr,
				isDone: !!isDone,
				isToday: i === 0
			});
		}
		return result;
	});
</script>

<div class="relative overflow-hidden rounded-2xl pixel-card bg-gradient-to-br from-card via-card/90 to-amber-500/5 p-5 space-y-4">
	<!-- Top Row: Streak & Words Learned Badges -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<div class="relative flex size-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 shadow-inner">
				<Flame class="size-6 fill-orange-400 text-orange-500 animate-pulse" />
				{#if practicedToday}
					<div class="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] shadow">
						✓
					</div>
				{/if}
			</div>
			<div>
				<div class="flex items-center gap-1.5">
					<span class="text-lg font-black font-mono tracking-tight text-foreground">{progress.streak} วัน</span>
					<span class="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
						สตรีครักษาต่อเนื่อง 🔥
					</span>
				</div>
				<p class="text-[11px] text-muted-foreground">
					{practicedToday ? 'ยอดเยี่ยม! คุณฝึกซ้อมครบตามเป้าหมายของวันนี้แล้ว' : 'วันนี้ยังไม่ได้ฝึกซ้อม มาเริ่มฝึกเลยเพื่อรักษาเสถียรภาพสตรีค!'}
				</p>
			</div>
		</div>

		<div class="hidden sm:flex flex-col items-end">
			<div class="flex items-center gap-1 text-xs font-bold text-primary">
				<Trophy class="size-4" />
				<span>HSK 1 Journey</span>
			</div>
			<span class="text-[10px] text-muted-foreground">ระดับความก้าวหน้า</span>
		</div>
	</div>

	<!-- Weekly 7-Day Consistency Tracker -->
	<div class="rounded-2xl border border-border/80 bg-background/60 p-3 space-y-2">
		<div class="flex items-center justify-between text-xs font-bold text-foreground px-1">
			<span class="flex items-center gap-1.5">
				<Sparkles class="size-3.5 text-amber-500" />
				บันทึกความสม่ำเสมอ 7 วันล่าสุด
			</span>
			<span class="text-[10px] text-muted-foreground font-mono">
				{weeklyActivity.filter(d => d.isDone).length}/7 วัน
			</span>
		</div>

		<div class="grid grid-cols-7 gap-1.5 pt-0.5">
			{#each weeklyActivity as day (day.dateStr)}
				<div class="flex flex-col items-center gap-1.5 py-2 rounded-xl {day.isToday ? 'bg-primary/10 border border-primary/30' : 'bg-muted/30'}">
					<span class="text-[10px] font-bold text-muted-foreground">{day.dayName}</span>
					<div class="flex size-7 items-center justify-center rounded-lg transition {day.isDone ? 'bg-orange-500 text-white shadow-xs' : 'bg-muted text-muted-foreground/60'}">
						{#if day.isDone}
							<CheckCircle2 class="size-4" />
						{:else}
							<span class="text-[10px] font-mono font-bold">·</span>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Words Learned & Vocabulary Milestone Progress -->
	<div class="space-y-2">
		<div class="flex items-center justify-between text-xs">
			<span class="flex items-center gap-1.5 font-bold text-foreground">
				<BookOpen class="size-4 text-blue-500" />
				คำศัพท์ที่จดจำและออกเสียงได้แล้ว
			</span>
			<span class="font-mono font-extrabold text-blue-600 dark:text-blue-400">
				{totalWordsLearned} <span class="text-muted-foreground font-normal">/ {hskGoalWords} คำ</span>
			</span>
		</div>

		<div class="h-2.5 w-full rounded-full bg-muted overflow-hidden p-0.5">
			<div
				class="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
				style="width: {wordProgressPercent}%"
			></div>
		</div>

		<div class="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
			<span>เป้าหมาย HSK 1: ฝึกฝนคำศัพท์พื้นฐานให้ครบถ้วน</span>
			<span class="font-mono font-bold text-foreground">{wordProgressPercent}%</span>
		</div>
	</div>

	<!-- Motivational Chinese Proverb Banner -->
	<div class="rounded-2xl border border-amber-300/60 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20 p-3 flex items-start gap-3">
		<div class="flex size-7 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
			语
		</div>
		<div class="text-xs space-y-0.5 min-w-0">
			<div class="font-bold text-foreground flex items-center gap-1.5">
				<span>千里之行，始于足下</span>
				<span class="text-[10px] text-muted-foreground font-normal">(qiānlǐ zhī xíng, shǐ yú zúxià)</span>
			</div>
			<p class="text-[11px] text-muted-foreground leading-relaxed">
				"การเดินทางพันลี้ เริ่มต้นที่ก้าวแรกเสมอ" — ฝึกพูดจีนทุกวันกับ AI ปลดล็อกสำเนียงเจ้าของภาษาทีละก้าว
			</p>
		</div>
	</div>
</div>
