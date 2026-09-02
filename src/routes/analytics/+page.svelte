<!-- src/routes/analytics/+page.svelte -->
<script lang="ts">
	import AppHeader from '$lib/components/AppHeader.svelte';
	import { selectArticulationGuides } from '$lib/analytics/articulationGuides';
	import {
		Activity,
		Volume2,
		Sparkles,
		AlertTriangle,
		ArrowRight,
		CheckCircle2,
		Info,
		Zap
	} from '@lucide/svelte';

	let { data } = $props();

	const stats = $derived(data.diagnostic);
	const hasData = $derived(stats?.hasData ?? false);
	const remedialCards = $derived(data.remedialCards || []);

	// Active tab for Pitch Contour demo
	let selectedToneTab = $state<1 | 2 | 3 | 4>(3);
	// Articulatory guidance boxes selected from actually-detected weak points
	const articulationGuides = $derived(
		selectArticulationGuides(stats?.weakPhonemes ?? [], stats?.weakTones ?? [])
	);
</script>

<AppHeader showBack backHref="/" />

<main class="mx-auto max-w-4xl px-4 py-6 sm:py-8 space-y-7">
	<!-- 1. HEADER (Minimal & Clean) -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
				ผลการออกเสียงของคุณ
			</h1>
			<p class="text-xs sm:text-sm text-muted-foreground mt-1">
				สรุปความแม่นยำและจุดที่ควรเน้นฝึกจากการออกเสียงจริง
			</p>
		</div>

		<a
			href="/pitch"
			class="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95 self-start sm:self-auto"
		>
			<span>ห้องฝึกพูด</span>
			<ArrowRight class="size-3.5" />
		</a>
	</div>

	<!-- 2. EMPTY STATE หรือ สถิติหลัก 4 ใบ -->
	{#if !stats || !stats.hasData}
		<div class="rounded-3xl border border-dashed bg-card/60 p-8 sm:p-10 text-center space-y-4">
			<div class="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
				<Zap class="size-6" />
			</div>
			<div class="space-y-1">
				<h2 class="text-base sm:text-lg font-bold text-foreground">ยังไม่มีประวัติการฝึกออกเสียง</h2>
				<p class="text-xs text-muted-foreground max-w-md mx-auto">
					เริ่มฝึกพูดสัก 2-3 คำในห้องฝึก เพื่อให้ระบบวิเคราะห์จุดอ่อนและจัดชุดคำศัพท์ที่เหมาะกับคุณโดยเฉพาะ
				</p>
			</div>
			<a
				href="/pitch"
				class="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95"
			>
				<span>เริ่มฝึกพูดเลย</span>
				<ArrowRight class="size-3.5" />
			</a>
		</div>
	{:else}
		<!-- 3 STAT CARDS (Minimal Metric Cards) -->
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
			<!-- Overall Accuracy -->
			<div class="rounded-2xl border bg-card p-4 space-y-1 shadow-sm">
				<div class="flex items-center justify-between text-xs text-muted-foreground font-medium">
					<span>ความแม่นยำรวม</span>
					<Activity class="size-3.5 text-emerald-600" />
				</div>
				<div class="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
					{stats.overallAccuracy}%
				</div>
				<div class="text-[11px] text-muted-foreground">
					จากการฝึก {stats.totalAttempts} ครั้ง
				</div>
			</div>

			<!-- Error Rate -->
			<div class="rounded-2xl border bg-card p-4 space-y-1 shadow-sm">
				<div class="flex items-center justify-between text-xs text-muted-foreground font-medium">
					<span>อัตราเสียงเพี้ยน</span>
					<AlertTriangle class="size-3.5 text-amber-600" />
				</div>
				<div class="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
					{stats.avgPer ?? '-'}
				</div>
				<div class="text-[11px] text-muted-foreground">
					{stats.avgPer && stats.avgPer > 0.2 ? 'ต้องฝึกซ้ำบางเสียง' : 'อยู่ในเกณฑ์ดี'}
				</div>
			</div>

			<!-- Listening Impact -->
			<div class="rounded-2xl border bg-card p-4 space-y-1 shadow-sm">
				<div class="flex items-center justify-between text-xs text-muted-foreground font-medium">
					<span>ฟังต้นแบบช่วยได้</span>
					<Volume2 class="size-3.5 text-sky-600" />
				</div>
				<div class="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">
					{#if stats.listeningImpact?.scoreDelta !== null && stats.listeningImpact?.scoreDelta !== undefined}
						{stats.listeningImpact.scoreDelta > 0 ? '+' : ''}{stats.listeningImpact.scoreDelta}
					{:else}
						-
					{/if}
				</div>
				<div class="text-[11px] text-muted-foreground">
					คะแนนเพิ่มขึ้นเมื่อกดฟังก่อนพูด
				</div>
			</div>
		</div>

		<!-- 3. HERO: คำศัพท์แนะนำสำหรับคุณ (Adaptive Practice) -->
		<section class="space-y-3">
			<div class="flex items-baseline justify-between">
				<div>
					<h2 class="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
						<span>🎯 คำศัพท์แนะนำสำหรับฝึกซ่อมเสริม</span>
					</h2>
					<p class="text-xs text-muted-foreground">
						คัดเลือกเพื่อช่วยแก้ไขจุดอ่อนเฉพาะบุคคลของคุณ
					</p>
				</div>
			</div>

			{#if remedialCards.length === 0}
				<div class="rounded-2xl border border-dashed p-6 text-center text-xs text-muted-foreground">
					ยังไม่พบจุดอ่อนที่ต้องซ่อมเสริม ออกเสียงได้แม่นยำดีมาก!
				</div>
			{:else}
				<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
					{#each remedialCards as rec}
						<div class="group rounded-2xl border bg-card p-4 shadow-sm flex flex-col justify-between space-y-3 hover:border-emerald-500 hover:shadow-md transition">
							<div>
								<div class="flex items-center justify-between">
									<span class="text-2xl sm:text-3xl font-black text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
										{rec.hanzi}
									</span>
									<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
										{rec.tag}
									</span>
								</div>
								<div class="text-xs sm:text-sm font-bold text-sky-600 dark:text-sky-400 font-mono mt-0.5">
									{rec.pinyin}
								</div>
								<div class="text-xs font-medium text-muted-foreground mt-0.5">
									{rec.thai}
								</div>
								<div class="text-[11px] text-muted-foreground/80 mt-2 line-clamp-2 leading-relaxed">
									{rec.reason}
								</div>
							</div>

							<a
								href="/pitch?word={encodeURIComponent(rec.hanzi)}"
								class="flex items-center justify-center gap-1.5 w-full rounded-xl bg-muted hover:bg-emerald-600 hover:text-white py-1.5 text-xs font-bold transition active:scale-95 text-foreground"
							>
								<span>ฝึกคำนี้</span>
								<ArrowRight class="size-3" />
							</a>
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<!-- 4. จุดที่ควรเน้น & วิธีแก้ไข (Focus Tips) -->
		{#if articulationGuides.length > 0 || (stats.frequentSubstitutions && stats.frequentSubstitutions.length > 0)}
			<section class="rounded-3xl border bg-card p-5 space-y-4 shadow-sm">
				<div class="flex items-center gap-2">
					<Sparkles class="size-4 text-emerald-600" />
					<h2 class="text-base font-bold text-foreground">เทคนิคการออกเสียงเฉพาะจุด</h2>
				</div>

				<!-- Frequent Substitutions Tag Bar -->
				{#if stats.frequentSubstitutions && stats.frequentSubstitutions.length > 0}
					<div class="flex flex-wrap items-center gap-2 text-xs">
						<span class="text-muted-foreground text-[11px] font-medium">เสียงที่มักสลับ:</span>
						{#each stats.frequentSubstitutions.slice(0, 4) as sub}
							<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-300 font-semibold text-xs border border-rose-500/20">
								<span class="font-mono font-bold">/{sub.target}/</span>
								<span class="text-[10px] text-muted-foreground">สับสนเป็น</span>
								<span class="font-mono font-bold text-amber-600">/{sub.recognized}/</span>
							</span>
						{/each}
					</div>
				{/if}

				<!-- Articulation Guide Cards -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{#each articulationGuides as guide}
						<div class="rounded-2xl border bg-muted/30 p-3.5 space-y-1.5">
							<div class="text-xs font-bold text-foreground">
								{guide.title}
							</div>
							<p class="text-[11px] text-muted-foreground leading-relaxed">
								{guide.observed}
							</p>
							<div class="pt-1 text-[11px] space-y-0.5 text-emerald-700 dark:text-emerald-300">
								{#each guide.fixes as fix, idx}
									<div class="flex items-start gap-1">
										<span class="font-bold">•</span>
										<span>{fix}</span>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- 5. กราฟวรรณยุกต์ (Tone Pitch) -->
		<section class="rounded-3xl border bg-card p-5 space-y-4 shadow-sm">
			<div class="flex items-center justify-between border-b pb-3">
				<div>
					<h2 class="text-base font-bold text-foreground">เส้นระดับเสียง (Pitch Contour)</h2>
					<p class="text-[11px] text-muted-foreground">เปรียบเทียบระดับเสียงวรรณยุกต์ 4 เสียง</p>
				</div>

				<!-- Tone Tabs -->
				<div class="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
					{#each [1, 2, 3, 4] as t}
						<button
							type="button"
							onclick={() => (selectedToneTab = t as 1 | 2 | 3 | 4)}
							class="rounded-lg px-2.5 py-1 text-xs font-bold transition {selectedToneTab === t
								? 'bg-primary text-primary-foreground shadow-sm'
								: 'text-muted-foreground hover:text-foreground'}"
						>
							เสียง {t}
						</button>
					{/each}
				</div>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
				<!-- Minimal Pitch SVG -->
				<div class="md:col-span-2 rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-2">
					<div class="flex justify-between text-[11px] text-slate-400">
						<span class="text-sky-400 font-bold">● เส้นมาตรฐาน</span>
						<span class="text-emerald-400 font-bold">● เสียงของคุณ</span>
					</div>

					<div class="h-32 w-full flex items-center justify-center relative">
						<svg viewBox="0 0 400 140" class="w-full h-full">
							{#if selectedToneTab === 1}
								<path d="M 40 25 L 360 25" stroke="#38bdf8" stroke-width="4" fill="none" stroke-linecap="round" />
								<path d="M 45 28 Q 200 24 355 26" stroke="#34d399" stroke-width="3" stroke-dasharray="6,4" fill="none" />
							{:else if selectedToneTab === 2}
								<path d="M 40 85 Q 200 60 360 25" stroke="#38bdf8" stroke-width="4" fill="none" stroke-linecap="round" />
								<path d="M 45 90 Q 210 65 355 30" stroke="#34d399" stroke-width="3" stroke-dasharray="6,4" fill="none" />
							{:else if selectedToneTab === 3}
								<path d="M 40 95 Q 180 135 360 50" stroke="#38bdf8" stroke-width="4" fill="none" stroke-linecap="round" />
								<path d="M 45 90 Q 180 115 355 58" stroke="#f43f5e" stroke-width="3" stroke-dasharray="6,4" fill="none" />
							{:else if selectedToneTab === 4}
								<path d="M 40 25 L 360 125" stroke="#38bdf8" stroke-width="4" fill="none" stroke-linecap="round" />
								<path d="M 45 30 L 355 120" stroke="#34d399" stroke-width="3" stroke-dasharray="6,4" fill="none" />
							{/if}
						</svg>
					</div>

					<div class="text-[11px] text-center">
						{#if stats.toneAccuracy[`tone${selectedToneTab}`]?.isWeak}
							<span class="text-rose-400 font-semibold">⚠️ เสียงนี้ยังต่ำกว่าเกณฑ์:</span> ควรฝึกกดระดับเสียงให้แม่นยำขึ้น
						{:else if stats.toneAccuracy[`tone${selectedToneTab}`]?.accuracy !== null}
							<span class="text-emerald-400 font-semibold">✅ แม่นยำ:</span> ระดับเสียงสอดคล้องกับมาตรฐาน
						{:else}
							<span class="text-slate-500">ยังไม่มีข้อมูลการฝึกเสียงนี้</span>
						{/if}
					</div>
				</div>

				<!-- Tone Breakdown Bars -->
				<div class="space-y-2.5">
					{#each Object.values(stats.toneAccuracy) as t}
						<div class="space-y-1">
							<div class="flex justify-between text-xs">
								<span class="font-medium {t.isWeak ? 'text-rose-500 font-bold' : 'text-foreground'}">
									{t.name.split(' ')[0]} {t.name.split(' ')[1]}
								</span>
								<span class="font-mono font-bold text-foreground">
									{t.accuracy !== null ? `${t.accuracy}%` : '-'}
								</span>
							</div>
							<div class="h-1.5 w-full rounded-full bg-muted overflow-hidden">
								{#if t.accuracy !== null}
									<div
										class="h-full rounded-full transition-all {t.accuracy >= 80 ? 'bg-emerald-500' : t.accuracy >= 70 ? 'bg-amber-500' : 'bg-rose-500'}"
										style="width: {t.accuracy}%"
									></div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- 6. ความแม่นยำรายพยัญชนะต้น (เฉพาะพยัญชนะต้นจริง /b/, /d/, /zh/, /sh/) -->
		{#if stats.phonemeBreakdown && stats.phonemeBreakdown.length > 0}
			<section class="rounded-3xl border bg-card p-5 space-y-3 shadow-sm">
				<div class="flex items-center justify-between border-b pb-3">
					<div>
						<h2 class="text-base font-bold text-foreground">ความแม่นยำรายพยัญชนะต้น</h2>
						<p class="text-[11px] text-muted-foreground">คะแนนความชัดเจนของพยัญชนะ (Shengmu) ที่ตรวจพบจากการฝึกจริง</p>
					</div>
					<span class="text-xs text-muted-foreground font-medium">
						{stats.phonemeBreakdown.length} พยัญชนะ
					</span>
				</div>

				<div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
					{#each stats.phonemeBreakdown as item (item.phoneme)}
						{@const isGood = item.avgGop >= 80}
						{@const isFair = item.avgGop >= 60}
						<div class="rounded-xl border p-2.5 text-center space-y-1 bg-background">
							<div class="font-mono text-base font-black text-foreground">
								/{item.phoneme}/
							</div>
							<div class="text-xs font-bold {isGood ? 'text-emerald-600 dark:text-emerald-400' : isFair ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}">
								{item.avgGop}
							</div>
							<div class="text-[10px] text-muted-foreground">
								{item.totalAttempts} ครั้ง
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}
	{/if}

</main>

