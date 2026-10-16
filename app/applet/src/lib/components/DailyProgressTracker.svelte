<script lang="ts">
	import { Flame, Trophy, BookOpen, CheckCircle2, Sparkles, Target, Award, ArrowRight } from '@lucide/svelte';
	import { progress } from '$lib/progress.svelte';

	// Calculate words learned based on completed lessons / stars
	let completedLessonsCount = $derived(Object.keys(progress.completed || {}).length);
	let totalWordsLearned = $derived(completedLessonsCount * 5 + (progress.xp > 0 ? 3 : 0));
	let hskGoalWords = 150; // HSK 1 target words
	let wordProgressPercent = $derived(Math.min(100, Math.round((totalWordsLearned / hskGoalWords) * 100)));

	// Segmented Pixel Progress Bar (10 blocks)
	const totalSegments = 10;
	let filledSegments = $derived(Math.min(totalSegments, Math.max(0, Math.round((wordProgressPercent / 100) * totalSegments))));

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

<div class="relative overflow-hidden rounded-xl pixel-card bg-gradient-to-br from-card via-card/90 to-amber-500/5 p-5 space-y-4">
	<!-- Top Row: Streak & Words Learned Badges -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<div class="relative flex size-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 pixel-badge">
				<Flame class="size-6 fill-orange-400 text-orange-500 animate-pulse" />
				{#if practicedToday}
					<div class="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-md bg-emerald-600 text-white text-[10px] pixel-badge shadow">
						✓
					</div>
				{/if}
			</div>
			<div>
				<div class="flex items-center gap-1.5">
					<span class="text-lg font-black font-mono tracking-tight text-foreground">{progress.streak} วัน</span>
					<span class="text-xs font-bold text-orange-700 dark:text-orange-300 bg-orange-500/15 px-2 py-0.5 rounded pixel-badge">
						สตรีครักษาต่อเนื่อง 🔥
					</span>
				</div>
				<p class="text-[11px] text-muted-foreground font-medium">
					{practicedToday ? 'ยอดเยี่ยม! คุณฝึกซ้อมครบตามเป้าหมายของวันนี้แล้ว' : 'วันนี้ยังไม่ได้ฝึกซ้อม มาเริ่มฝึกเลยเพื่อรักษาเสถียรภาพสตรีค!'}
				</p>
			</div>
		</div>

		<div class="hidden sm:flex flex-col items-end">
			<div class="flex items-center gap-1 text-xs font-bold text-primary pixel-badge px-2 py-0.5">
				<Trophy class="size-4" />
				<span>HSK 1 Journey</span>
			</div>
			<span class="text-[10px] text-muted-foreground mt-1">ระดับความก้าวหน้า</span>
		</div>
	</div>

	<!-- Weekly 7-Day Consistency Tracker -->
	<div class="rounded-xl border-2 border-foreground/80 bg-background/80 p-3 space-y-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.85)]">
		<div class="flex items-center justify-between text-xs font-bold text-foreground px-1">
			<span class="flex items-center gap-1.5">
				<Sparkles class="size-3.5 text-amber-500" />
				บันทึกความสม่ำเสมอ 7 วันล่าสุด
			</span>
			<span class="text-[10px] text-muted-foreground font-mono font-bold">
				{weeklyActivity.filter(d => d.isDone).length}/7 วัน
			</span>
		</div>

		<div class="grid grid-cols-7 gap-1.5 pt-0.5">
			{#each weeklyActivity as day (day.dateStr)}
				<div class="flex flex-col items-center gap-1 py-2 rounded-lg border-2 {day.isToday ? 'border-primary bg-primary/15' : 'border-border bg-muted/40'}">
					<span class="text-[10px] font-bold text-muted-foreground">{day.dayName}</span>
					<div class="flex size-6 items-center justify-center rounded font-mono text-xs {day.isDone ? 'bg-orange-500 text-white font-black pixel-badge' : 'bg-muted text-muted-foreground/60 border border-border'}">
						{#if day.isDone}
							✓
						{:else}
							·
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Words Learned & Segmented Pixel-Art Progress Bar -->
	<div class="space-y-2.5 rounded-xl border-2 border-foreground/80 bg-background/80 p-3.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.85)]">
		<div class="flex items-center justify-between text-xs">
			<span class="flex items-center gap-1.5 font-bold text-foreground">
				<BookOpen class="size-4 text-emerald-600 dark:text-emerald-400" />
				คำศัพท์ที่จดจำและออกเสียงได้แล้ว
			</span>
			<span class="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
				{totalWordsLearned} <span class="text-muted-foreground font-normal">/ {hskGoalWords} คำ</span>
			</span>
		</div>

		<!-- Segmented Pixel-Art Progress Bar Blocks -->
		<div class="grid grid-cols-10 gap-1 h-5 w-full">
			{#each Array(totalSegments) as _, i}
				<div
					class="h-full rounded-xs border-2 transition-all duration-200 {i < filledSegments ? 'bg-emerald-500 border-foreground shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]' : 'bg-muted/60 border-border/80'}"
					title={`Segment ${i + 1} of ${totalSegments}`}
				></div>
			{/each}
		</div>

		<div class="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5 font-medium">
			<span>เป้าหมาย HSK 1: สำเร็จตามเกณฑ์พิกเซล</span>
			<span class="font-mono font-bold text-foreground">{wordProgressPercent}%</span>
		</div>
	</div>

	<!-- Motivational Chinese Proverb Banner -->
	<div class="rounded-xl border-2 border-amber-600/60 bg-amber-50/70 dark:border-amber-700/60 dark:bg-amber-950/30 p-3 flex items-start gap-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.85)]">
		<div class="flex size-7 shrink-0 items-center justify-center rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold pixel-badge">
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
