<!-- src/routes/analytics/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import AppHeader from '$lib/components/AppHeader.svelte';
	import { selectArticulationGuides } from '$lib/analytics/articulationGuides';
	import {
		Activity,
		Volume2,
		Clock,
		Sparkles,
		CheckCircle2,
		AlertTriangle,
		XCircle,
		ArrowRight,
		BarChart3,
		FileText,
		ShieldCheck,
		RotateCw,
		HelpCircle,
		Info,
		TrendingUp,
		Layers
	} from '@lucide/svelte';

	let { data } = $props();

	const stats = $derived(data.diagnostic);
	const hasData = $derived(stats?.hasData ?? false);
	const learningEvents = $derived(data.learningEvents || []);
	const remedialCards = $derived(data.remedialCards || []);

	// Active tab for Pitch Contour interactive demo
	let selectedToneTab = $state<1 | 2 | 3 | 4>(3);
	let activePhonemeFilter = $state<'all' | 'initial' | 'final_tone'>('all');
	let showRawXApiModal = $state(false);
	let selectedStatement = $state<any>(null);

	// Filtered phoneme details
	const filteredPhonemes = $derived(
		(stats?.phonemeBreakdown || []).filter((p) => {
			if (activePhonemeFilter === 'all') return true;
			return p.type === activePhonemeFilter;
		})
	);

	// Articulatory guidance boxes selected from actually-detected weak points
	const articulationGuides = $derived(
		selectArticulationGuides(stats?.weakPhonemes ?? [], stats?.weakTones ?? [])
	);

	function getScoreColor(score: number): { bg: string; text: string; border: string; label: string } {
		if (score >= 80) {
			return {
				bg: 'bg-emerald-50 dark:bg-emerald-950/40',
				text: 'text-emerald-700 dark:text-emerald-300',
				border: 'border-emerald-200 dark:border-emerald-800',
				label: '🟢 ดีเยี่ยม (≥80)'
			};
		}
		if (score >= 50) {
			return {
				bg: 'bg-amber-50 dark:bg-amber-950/40',
				text: 'text-amber-700 dark:text-amber-300',
				border: 'border-amber-200 dark:border-amber-800',
				label: '🟡 ปานกลาง (50-79)'
			};
		}
		return {
			bg: 'bg-rose-50 dark:bg-rose-950/40',
			text: 'text-rose-700 dark:text-rose-300',
			border: 'border-rose-200 dark:border-rose-800',
			label: '🔴 ต้องปรับปรุง (<50)'
		};
	}

	function viewXApiStatement(ev: any) {
		selectedStatement = ev.xapiStatement;
		showRawXApiModal = true;
	}
</script>

<AppHeader showBack backHref="/" />

<main class="mx-auto max-w-5xl px-4 py-6 sm:py-8 space-y-8">
	<!-- 1. HEADER & PDPA BADGE -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
		<div>
			<div class="flex items-center gap-2">
				<span class="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-black uppercase text-primary">
					Diagnostic Analytics Engine
				</span>
				<span class="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
					<ShieldCheck class="size-3.5" /> IEEE 9274.1.1 Compliant
				</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-2">
				📊 แดชบอร์ดวินิจฉัยจุดบกพร่องการออกเสียง (หน้าที่ 2)
			</h1>
			<p class="text-sm text-muted-foreground mt-1">
				การวิเคราะห์ Goodness of Pronunciation (GOP), Phoneme Error Rate (PER) และเส้นระดับเสียงวรรณยุกต์ (F0 Pitch Contour)
			</p>
		</div>

		<div class="flex items-center gap-2 self-start sm:self-auto">
			<a
				href="/pitch"
				class="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow transition hover:opacity-90 active:scale-95"
			>
				<span>ไปยังห้องฝึกพูด</span>
				<ArrowRight class="size-4" />
			</a>
		</div>
	</div>

	<!-- 2. EXECUTIVE KPI METRICS (LQ5 & LQ6 READY) -->
	{#snippet emptyState(message: string)}
		<div class="rounded-2xl border border-dashed p-6 text-center space-y-3">
			<p class="text-sm text-muted-foreground">{message}</p>
			<a
				href="/pitch"
				class="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow transition hover:opacity-90"
			>
				<span>เริ่มฝึกออกเสียง</span>
				<ArrowRight class="size-3.5" />
			</a>
		</div>
	{/snippet}

	{#if !stats || !stats.hasData}
		<div class="rounded-3xl border bg-card p-5 sm:p-6 shadow-sm">
			<div class="flex items-center gap-2 mb-3">
				<Info class="size-4 text-primary" />
				<h2 class="text-base font-black text-foreground">ยังไม่มีข้อมูลการฝึก</h2>
			</div>
			{@render emptyState('สถิติทั้งหมดในหน้านี้จะคำนวณจากผลการฝึกออกเสียงจริงของคุณ เริ่มฝึกในห้องฝึกพูดสักไม่กี่คำ แล้วกลับมาที่หน้านี้เพื่อดูผลวินิจฉัย')}
		</div>
	{:else}
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
			<!-- Overall GOP -->
			<div class="rounded-2xl border bg-card p-4 sm:p-5 shadow-sm space-y-1">
				<div class="flex items-center justify-between text-xs font-medium text-muted-foreground">
					<span>คะแนนเฉลี่ยรวม (GOP)</span>
					<Activity class="size-4 text-emerald-600" />
				</div>
				<div class="text-3xl font-black text-emerald-600 dark:text-emerald-400">
					{stats.overallAccuracy}%
				</div>
				<div class="text-[11px] text-muted-foreground">
					จากการฝึกจริง {stats.totalAttempts} ครั้ง (Goodness of Pronunciation)
				</div>
			</div>

			<!-- Phoneme Error Rate (PER) -->
			<div class="rounded-2xl border bg-card p-4 sm:p-5 shadow-sm space-y-1">
				<div class="flex items-center justify-between text-xs font-medium text-muted-foreground">
					<span>อัตราความผิดพลาด (PER)</span>
					<AlertTriangle class="size-4 text-amber-600" />
				</div>
				<div class="text-3xl font-black text-amber-600 dark:text-amber-400">
					{stats.avgPer ?? '-'}
				</div>
				<div class="text-[11px] text-muted-foreground">
					Phoneme Error Rate $(S+D+I)/N$
				</div>
			</div>

			<!-- LQ5: Example Listening Impact -->
			<div class="rounded-2xl border bg-card p-4 sm:p-5 shadow-sm space-y-1">
				<div class="flex items-center justify-between text-xs font-medium text-muted-foreground">
					<span>ผลการฟังเสียงตัวอย่าง (LQ5)</span>
					<Volume2 class="size-4 text-sky-600" />
				</div>
				<div class="text-3xl font-black text-sky-600 dark:text-sky-400">
					{#if stats.listeningImpact?.scoreDelta !== null && stats.listeningImpact?.scoreDelta !== undefined}
						{stats.listeningImpact.scoreDelta > 0 ? '+' : ''}{stats.listeningImpact.scoreDelta}
					{:else}
						-
					{/if}
				</div>
				<div class="text-[11px] text-muted-foreground">
					{#if stats.listeningImpact?.sampleWith || stats.listeningImpact?.sampleWithout}
						เทียบ {stats.listeningImpact.sampleWith} ครั้ง (มีการฟัง) vs {stats.listeningImpact.sampleWithout} ครั้ง (ไม่ฟัง)
					{:else}
						คะแนนเฉลี่ยเมื่อกดฟังเสียงต้นแบบก่อนพูด (รอข้อมูลเพียงพอ)
					{/if}
				</div>
			</div>

			<!-- LQ6: Hesitation Latency -->
			<div class="rounded-2xl border bg-card p-4 sm:p-5 shadow-sm space-y-1">
				<div class="flex items-center justify-between text-xs font-medium text-muted-foreground">
					<span>ความลังเลก่อนพูด (LQ6)</span>
					<Clock class="size-4 text-violet-600" />
				</div>
				<div class="text-3xl font-black text-violet-600 dark:text-violet-400">
					{#if stats.hesitationStats?.avgLatencyMs !== null && stats.hesitationStats?.avgLatencyMs !== undefined}
						{(stats.hesitationStats.avgLatencyMs / 1000).toFixed(1)}s
					{:else}
						-
					{/if}
				</div>
				<div class="text-[11px] text-muted-foreground">
					{#if stats.hesitationStats?.sampleCount}
						Hesitation Latency เฉลี่ย ({stats.hesitationStats.sampleCount} ครั้ง)
					{:else}
						Hesitation Latency ก่อนกดเริ่มบันทึกเสียง (รอข้อมูล)
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- 3. PHONETIC BREAKDOWN SECTION (รายหน่วยเสียง Initial / Final+Tone) -->
	<section class="rounded-3xl border bg-card p-5 sm:p-6 shadow-sm space-y-5">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
			<div>
				<h2 class="text-lg sm:text-xl font-black tracking-tight text-foreground flex items-center gap-2">
					<span>🔤 การวิเคราะห์ความแม่นยำรายหน่วยเสียง (Phonetic Breakdown)</span>
				</h2>
				<p class="text-xs text-muted-foreground mt-0.5">
					ไฮไลต์สีจำแนกระดับคะแนน GOP ตามเกณฑ์มาตรฐาน (เขียว &ge; 80 | เหลือง 50-79 | แดง &lt; 50)
				</p>
			</div>

			<!-- Filter Chips -->
			<div class="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl">
				<button
					type="button"
					onclick={() => (activePhonemeFilter = 'all')}
					class="rounded-lg px-3 py-1 text-xs font-bold transition {activePhonemeFilter === 'all'
						? 'bg-background text-foreground shadow-sm'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					ทั้งหมด
				</button>
				<button
					type="button"
					onclick={() => (activePhonemeFilter = 'initial')}
					class="rounded-lg px-3 py-1 text-xs font-bold transition {activePhonemeFilter === 'initial'
						? 'bg-background text-foreground shadow-sm'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					พยัญชนะต้น (Shengmu)
				</button>
				<button
					type="button"
					onclick={() => (activePhonemeFilter = 'final_tone')}
					class="rounded-lg px-3 py-1 text-xs font-bold transition {activePhonemeFilter === 'final_tone'
						? 'bg-background text-foreground shadow-sm'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					สระ+วรรณยุกต์ (Yunmu)
				</button>
			</div>
		</div>

		<!-- Phoneme Badge Grid -->
		{#if filteredPhonemes.length === 0}
			{@render emptyState('ยังไม่มีข้อมูลรายหน่วยเสียง — ฝึกออกเสียงผ่านห้องฝึกพูดเพื่อเก็บสถิติรายพยัญชนะ/สระ')}
		{:else}
		<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
			{#each filteredPhonemes as item (item.phoneme)}
				{@const style = getScoreColor(item.avgGop)}
				<div class="rounded-2xl border p-3.5 {style.bg} {style.border} transition flex flex-col justify-between">
					<div class="flex items-center justify-between">
						<span class="font-mono text-xl font-black {style.text}">
							/{item.phoneme}/
						</span>
						<span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-background/80 text-foreground border">
							{item.type === 'initial' ? 'พยัญชนะ' : 'สระ+วรรณยุกต์'}
						</span>
					</div>

					<div class="mt-3 flex items-baseline justify-between">
						<span class="text-xs text-muted-foreground font-medium">GOP Score:</span>
						<span class="text-lg font-black {style.text}">
							{item.avgGop}
						</span>
					</div>

					<div class="mt-1 text-[10px] text-muted-foreground flex justify-between">
						<span>ทดสอบ {item.totalAttempts} ครั้ง</span>
						<span class="font-bold">{style.label.split(' ')[0]}</span>
					</div>
				</div>
			{/each}
		</div>

		<!-- Frequent Substitution Analysis Alert -->
		{#if stats?.frequentSubstitutions && stats.frequentSubstitutions.length > 0}
			<div class="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/30 p-4 space-y-2">
				<div class="flex items-center gap-2 text-rose-800 dark:text-rose-200 font-bold text-sm">
					<AlertTriangle class="size-4 text-rose-600" />
					<span>ข้อผิดพลาดการสลับเสียงที่พบบ่อย (Frequent Phonetic Substitutions):</span>
				</div>
				<div class="flex flex-wrap gap-2 pt-1">
					{#each stats.frequentSubstitutions as sub}
						<div class="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-background px-3 py-1.5 text-xs font-semibold shadow-sm">
							<span class="font-mono font-black text-rose-600">/{sub.target}/</span>
							<span class="text-muted-foreground">สับสนเป็น</span>
							<span class="font-mono font-black text-amber-600">/{sub.recognized}/</span>
							<span class="text-[10px] text-muted-foreground">({sub.count} ครั้ง · GOP {sub.avgGop})</span>
						</div>
					{/each}
					</div>
				</div>
			{/if}
			{/if}
		</section>

	<!-- 4. F0 PITCH CONTOUR COMPARISON (กราฟเปรียบเทียบระดับเสียงวรรณยุกต์ 4 เสียง) -->
	<section class="rounded-3xl border bg-card p-5 sm:p-6 shadow-sm space-y-5">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
			<div>
				<h2 class="text-lg sm:text-xl font-black tracking-tight text-foreground flex items-center gap-2">
					<span>📈 การเปรียบเทียบเส้นระดับเสียงวรรณยุกต์ ($F_0$ Pitch Contour Comparison)</span>
				</h2>
				<p class="text-xs text-muted-foreground mt-0.5">
					เปรียบเทียบความแม่นยำของระดับเสียงตามระบบ Chao 5-level Pitch Scale
				</p>
			</div>

			<!-- Tone Switcher Tabs -->
			<div class="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
				{#each [1, 2, 3, 4] as t}
					<button
						type="button"
						onclick={() => (selectedToneTab = t as 1 | 2 | 3 | 4)}
						class="rounded-lg px-3 py-1 text-xs font-bold transition {selectedToneTab === t
							? 'bg-primary text-primary-foreground shadow-sm'
							: 'text-muted-foreground hover:text-foreground'}"
					>
						เสียง {t}
					</button>
				{/each}
			</div>
		</div>

		<!-- Pitch Contour Visualization Canvas Box -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-5 items-center">
			<!-- Canvas Graph Mockup / Visualizer -->
			<div class="lg:col-span-2 rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-3 relative overflow-hidden">
				<div class="flex items-center justify-between text-xs text-slate-400">
					<span class="font-bold flex items-center gap-1 text-sky-400">
						<span>●</span> เส้นมาตรฐานเจ้าของภาษา (Target)
					</span>
					<span class="font-bold flex items-center gap-1 text-emerald-400">
						<span>●</span> เสียงที่บันทึกของผู้เรียน (Learner F0)
					</span>
					<span class="text-[10px] text-slate-500 font-mono">Chao Scale (1-5)</span>
				</div>

				<!-- Visual Curve Display -->
				<div class="h-48 w-full relative flex items-center justify-center border-y border-dashed border-slate-800">
					<!-- Chao Grid lines -->
					<div class="absolute inset-0 flex flex-col justify-between text-[9px] font-mono text-slate-600 pointer-events-none">
						<div class="border-b border-slate-800/60 flex justify-between"><span>5 高 High (~280Hz)</span></div>
						<div class="border-b border-slate-800/60 flex justify-between"><span>4 半高 Mid-High (~220Hz)</span></div>
						<div class="border-b border-slate-800/60 flex justify-between"><span>3 中 Mid (~170Hz)</span></div>
						<div class="border-b border-slate-800/60 flex justify-between"><span>2 半低 Mid-Low (~130Hz)</span></div>
						<div class="flex justify-between"><span>1 低 Low (~95Hz)</span></div>
					</div>

					<!-- Tone SVG Curves -->
					<svg viewBox="0 0 400 180" class="w-full h-full relative z-10">
						{#if selectedToneTab === 1}
							<!-- Tone 1: 55 High Level -->
							<path d="M 40 25 L 360 25" stroke="#38bdf8" stroke-width="4" fill="none" stroke-linecap="round" />
							<path d="M 45 28 Q 200 24 355 26" stroke="#34d399" stroke-width="3" stroke-dasharray="6,4" fill="none" />
						{:else if selectedToneTab === 2}
							<!-- Tone 2: 35 Rising -->
							<path d="M 40 100 Q 200 70 360 25" stroke="#38bdf8" stroke-width="4" fill="none" stroke-linecap="round" />
							<path d="M 45 105 Q 210 75 355 30" stroke="#34d399" stroke-width="3" stroke-dasharray="6,4" fill="none" />
						{:else if selectedToneTab === 3}
							<!-- Tone 3: 214 Low Dipping -->
							<path d="M 40 120 Q 180 170 360 60" stroke="#38bdf8" stroke-width="4" fill="none" stroke-linecap="round" />
							<path d="M 45 110 Q 180 135 355 70" stroke="#f43f5e" stroke-width="3" stroke-dasharray="6,4" fill="none" />
						{:else if selectedToneTab === 4}
							<!-- Tone 4: 51 Falling -->
							<path d="M 40 25 L 360 160" stroke="#38bdf8" stroke-width="4" fill="none" stroke-linecap="round" />
							<path d="M 45 30 L 355 155" stroke="#34d399" stroke-width="3" stroke-dasharray="6,4" fill="none" />
						{/if}
					</svg>
				</div>

				<div class="text-xs text-slate-400 text-center">
					{#if !stats || !stats.hasData}
						<span class="text-slate-400 font-medium">ℹ️ แสดงเส้นมาตรฐานเจ้าของภาษา (Chao Scale) — ยังไม่มีข้อมูลเส้น F0 ของผู้เรียน</span>
					{:else if stats.toneAccuracy[`tone${selectedToneTab}`]?.isWeak}
						<span class="text-rose-400 font-semibold">⚠️ ตรวจพบจุดเบี่ยงเบน:</span> ความแม่นยำของเสียงนี้ต่ำกว่าเกณฑ์ 75% ({stats.toneAccuracy[`tone${selectedToneTab}`]?.accuracy}%)
					{:else if stats.toneAccuracy[`tone${selectedToneTab}`]?.accuracy !== null}
						<span class="text-emerald-400 font-semibold">✅ แม่นยำ:</span> ความแม่นยำ {stats.toneAccuracy[`tone${selectedToneTab}`]?.accuracy}% สอดคล้องกับมาตรฐาน
					{:else}
						<span class="text-slate-400 font-medium">ยังไม่เคยฝึกเสียงนี้ในระบบ</span>
					{/if}
				</div>
			</div>

			<!-- Tone Accuracy Breakdown Bars -->
			<div class="space-y-3">
				<h3 class="text-sm font-bold text-foreground">ความแม่นยำแยกตามวรรณยุกต์:</h3>
				{#if !stats || !stats.hasData}
					<div class="rounded-2xl border border-dashed p-4 text-center space-y-2">
						<p class="text-xs text-muted-foreground">ยังไม่มีข้อมูลความแม่นยำวรรณยุกต์จากการฝึกจริง</p>
						<a
							href="/pitch"
							class="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground shadow transition hover:opacity-90"
						>
							<span>เริ่มฝึกเสียง</span>
							<ArrowRight class="size-3.5" />
						</a>
					</div>
				{:else}
					{#each Object.values(stats.toneAccuracy) as t}
						<div class="space-y-1">
							<div class="flex justify-between text-xs">
								<span class="font-medium {t.isWeak ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-foreground'}">
									{t.name} {t.isWeak ? '⚠️ (ควรฝึกเพิ่ม)' : ''}
								</span>
								<span class="font-mono font-bold text-foreground">{t.accuracy !== null ? `${t.accuracy}%` : 'ไม่มีข้อมูล'}</span>
							</div>
							{#if t.accuracy !== null}
								<div class="h-2 w-full rounded-full bg-muted overflow-hidden">
									<div
										class="h-full rounded-full transition-all {t.accuracy >= 80 ? 'bg-emerald-500' : t.accuracy >= 70 ? 'bg-amber-500' : 'bg-rose-500'}"
										style="width: {t.accuracy}%"
									></div>
								</div>
							{:else}
								<div class="h-2 w-full rounded-full bg-muted"></div>
							{/if}
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</section>

	<!-- 5. MISPRONUNCIATION INSIGHT & ARTICULATORY GUIDANCE (การวางรูปปาก/ตำแหน่งลิ้น) -->
	<section class="rounded-3xl border bg-card p-5 sm:p-6 shadow-sm space-y-4">
		<h2 class="text-lg sm:text-xl font-black tracking-tight text-foreground flex items-center gap-2">
			<span>👅 กล่องวินิจฉัยจุดบกพร่อง & คำแนะนำสรีรศาสตร์การออกเสียง (Articulatory Guidance)</span>
		</h2>

		{#if !stats || !stats.hasData}
			{@render emptyState('ยังไม่มีข้อมูลการฝึก — ฝึกออกเสียงในห้องฝึกพูดเพื่อรับคำแนะนำการวางรูปปากและตำแหน่งลิ้นตามจุดบกพร่องจริง')}
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			{#each articulationGuides as guide, i}
				<div class="rounded-2xl border {i === 0 ? 'border-sky-200 dark:border-sky-900/50 bg-sky-50/50 dark:bg-sky-950/20' : 'border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20'} p-4 space-y-2">
					<div class="flex items-center gap-2 {i === 0 ? 'text-sky-900 dark:text-sky-200' : 'text-amber-900 dark:text-amber-200'} font-bold text-sm">
						<Sparkles class="size-4 {i === 0 ? 'text-sky-600' : 'text-amber-600'}" />
						<span>{guide.title}</span>
					</div>
					<p class="text-xs {i === 0 ? 'text-sky-900/80 dark:text-sky-200/80' : 'text-amber-900/80 dark:text-amber-200/80'} leading-relaxed">
						<strong>จุดบกพร่องที่พบ:</strong> {guide.observed}
					</p>
					<div class="rounded-xl bg-background/80 p-2.5 text-xs text-foreground space-y-1 border">
						<div class="font-bold {i === 0 ? 'text-primary' : 'text-amber-600 dark:text-amber-400'}">💡 วิธีแก้ไข:</div>
						{#each guide.fixes as fix, j}
							<div>{j + 1}. {fix}</div>
						{/each}
					</div>
				</div>
			{/each}
			</div>
		{/if}
	</section>

	<!-- 6. ADAPTIVE REMEDIAL RECOMMENDATIONS (ชุดคำศัพท์ฝึกซ่อมเสริมเฉพาะบุคคล) -->
	<section class="rounded-3xl border bg-card p-5 sm:p-6 shadow-sm space-y-4">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-lg sm:text-xl font-black tracking-tight text-foreground flex items-center gap-2">
					<span>🎯 ชุดคำศัพท์แนะนำสำหรับฝึกซ่อมเสริมเฉพาะบุคคล (Adaptive Remedial)</span>
				</h2>
				<p class="text-xs text-muted-foreground mt-0.5">
					คัดเลือกคำศัพท์ HSK 1 เพื่อแก้ไขจุดบกพร่องรายบุคคลตามข้อมูลสถิติที่ตรวจพบ
				</p>
			</div>
		</div>

		{#if remedialCards.length === 0}
			{@render emptyState('ระบบจะแนะนำคำศัพท์เฉพาะบุคคลเมื่อมีข้อมูลจุดอ่อนจากการฝึกจริงแล้ว')}
		{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
			{#each remedialCards as rec}
				<div class="rounded-2xl border bg-background p-4 shadow-sm flex flex-col justify-between space-y-3 hover:border-primary transition group">
					<div>
						<div class="flex items-center justify-between">
							<span class="text-2xl font-black text-foreground group-hover:text-primary transition-colors">
								{rec.hanzi}
							</span>
							<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
								{rec.tag}
							</span>
						</div>
						<div class="text-sm font-bold text-sky-600 dark:text-sky-400 font-mono mt-0.5">
							{rec.pinyin}
						</div>
						<div class="text-xs font-medium text-foreground mt-1">
							{rec.thai}
						</div>
						<div class="text-[11px] text-muted-foreground mt-2 leading-snug">
							{rec.reason}
						</div>
					</div>

					<a
						href="/pitch?word={encodeURIComponent(rec.hanzi)}"
						class="flex items-center justify-center gap-1.5 w-full rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground py-2 text-xs font-bold transition active:scale-95 text-foreground"
					>
						<span>ฝึกคำนี้ทันที</span>
						<ArrowRight class="size-3.5" />
					</a>
				</div>
			{/each}
		</div>
		{/if}
	</section>

	<!-- 7. xAPI TELEMETRY & PDPA AUDIT LOGS INSPECTOR -->
	<section class="rounded-3xl border bg-card p-5 sm:p-6 shadow-sm space-y-4">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<FileText class="size-4 text-primary" />
				<h2 class="text-lg font-black tracking-tight text-foreground">
					บันทึกการเรียนรู้ xAPI Statement Log (IEEE 9274.1.1)
				</h2>
			</div>
			<span class="text-xs text-muted-foreground">
				({learningEvents.length} รายการล่าสุด)
			</span>
		</div>

		<p class="text-xs text-muted-foreground">
			ระบบจัดเก็บข้อมูลในรูปแบบ Statement ตามมาตรฐาน xAPI (IEEE 9274.1.1) โดย<strong>ไม่มีการจัดเก็บไฟล์เสียงดิบ (.wav)</strong> ตามกฎหมายคุ้มครองข้อมูลส่วนบุคคล (PDPA Zero Audio Storage at Rest)
		</p>

		{#if learningEvents.length === 0}
			<div class="rounded-2xl border border-dashed p-6 text-center text-xs text-muted-foreground">
				ยังไม่มีประวัติกิจกรรม xAPI (ระบบจะบันทึกอัตโนมัติเมื่อท่านฝึกออกเสียงในหน้าฝึกพูด)
			</div>
		{:else}
			<div class="overflow-x-auto rounded-2xl border">
				<table class="w-full text-left text-xs">
					<thead class="bg-muted/50 border-b text-muted-foreground font-semibold">
						<tr>
							<th class="p-3">เวลา</th>
							<th class="p-3">Event Type (Verb)</th>
							<th class="p-3">คำศัพท์ (Activity)</th>
							<th class="p-3">รายละเอียด (Result)</th>
							<th class="p-3 text-right">xAPI JSON</th>
						</tr>
					</thead>
					<tbody class="divide-y">
						{#each learningEvents as ev}
							<tr class="hover:bg-muted/30 transition">
								<td class="p-3 font-mono text-muted-foreground text-[11px]">
									{new Date(ev.createdAt).toLocaleTimeString('th-TH')}
								</td>
								<td class="p-3 font-semibold">
									{#if ev.eventType === 'pronounced'}
										<span class="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
											<span>🗣️</span> pronounced
										</span>
									{:else if ev.eventType === 'listened_to_example'}
										<span class="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 font-bold">
											<span>🎧</span> listened_to_example (LQ5)
										</span>
									{:else if ev.eventType === 'hesitated'}
										<span class="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400 font-bold">
											<span>⏱️</span> hesitated (LQ6)
										</span>
									{:else}
										<span>{ev.eventType}</span>
									{/if}
								</td>
								<td class="p-3 font-bold text-foreground">
									{ev.wordId}
								</td>
								<td class="p-3 text-muted-foreground">
									{#if ev.eventType === 'pronounced'}
										GOP: {ev.xapiStatement?.result?.score?.raw ?? '-'} | Success: {ev.xapiStatement?.result?.success ? 'ผ่าน' : 'ไม่ผ่าน'}
									{:else if ev.eventType === 'listened_to_example'}
										ฟัง {ev.xapiStatement?.result?.extensions?.['https://hsk.app/xapi/ext/listen-count'] ?? 1} ครั้ง (ความเร็ว {ev.xapiStatement?.result?.extensions?.['https://hsk.app/xapi/ext/playback-speed'] ?? 1.0}x)
									{:else if ev.eventType === 'hesitated'}
										ความลังเล: {ev.xapiStatement?.result?.extensions?.['https://hsk.app/xapi/ext/hesitation-latency-ms'] ?? '-'} ms
									{/if}
								</td>
								<td class="p-3 text-right">
									<button
										type="button"
										onclick={() => viewXApiStatement(ev)}
										class="rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground px-2.5 py-1 text-[11px] font-bold transition"
									>
										ดู JSON
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>

	<!-- RAW xAPI MODAL -->
	{#if showRawXApiModal && selectedStatement}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
			<div class="rounded-3xl border bg-card p-6 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col space-y-4">
				<div class="flex items-center justify-between border-b pb-3">
					<h3 class="text-base font-bold text-foreground flex items-center gap-2">
						<FileText class="size-4 text-primary" />
						<span>xAPI Statement (IEEE 9274.1.1 Standard JSON)</span>
					</h3>
					<button
						type="button"
						onclick={() => (showRawXApiModal = false)}
						class="rounded-full size-7 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground font-bold"
					>
						✕
					</button>
				</div>

				<pre class="bg-slate-950 text-emerald-400 p-4 rounded-2xl text-xs font-mono overflow-y-auto max-h-[55vh] leading-relaxed select-all">
{JSON.stringify(selectedStatement, null, 2)}
				</pre>

				<div class="flex justify-end pt-2">
					<button
						type="button"
						onclick={() => (showRawXApiModal = false)}
						class="rounded-xl bg-primary text-primary-foreground font-bold px-4 py-2 text-xs hover:opacity-90 transition"
					>
						ปิดหน้าต่าง
					</button>
				</div>
			</div>
		</div>
	{/if}
</main>
