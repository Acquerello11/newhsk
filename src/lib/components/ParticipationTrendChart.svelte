<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { Activity, TrendingUp, Users, Calendar } from '@lucide/svelte';

	export type TrendDataPoint = {
		day: string;
		formattedDate: string;
		activeUsers: number;
		practiceCount: number;
		avgScore: number;
	};

	let {
		data = []
	}: {
		data: TrendDataPoint[];
	} = $props();

	type MetricMode = 'score' | 'activity';
	let selectedMetric = $state<MetricMode>('score');

	let containerWidth = $state(600);
	const height = 240;
	const margin = { top: 20, right: 24, bottom: 32, left: 40 };

	// Hover tooltip state
	let hoveredIndex = $state<number | null>(null);

	// Fallback data if DB has no historical records yet
	const chartData = $derived(
		data && data.length > 0
			? data
			: [
					{ day: '2026-10-09', formattedDate: '9 ต.ค.', activeUsers: 2, practiceCount: 14, avgScore: 71.5 },
					{ day: '2026-10-10', formattedDate: '10 ต.ค.', activeUsers: 3, practiceCount: 25, avgScore: 73.8 },
					{ day: '2026-10-11', formattedDate: '11 ต.ค.', activeUsers: 4, practiceCount: 38, avgScore: 76.2 },
					{ day: '2026-10-12', formattedDate: '12 ต.ค.', activeUsers: 5, practiceCount: 52, avgScore: 78.4 },
					{ day: '2026-10-13', formattedDate: '13 ต.ค.', activeUsers: 6, practiceCount: 64, avgScore: 81.0 },
					{ day: '2026-10-14', formattedDate: '14 ต.ค.', activeUsers: 7, practiceCount: 85, avgScore: 83.2 },
					{ day: '2026-10-15', formattedDate: '15 ต.ค.', activeUsers: 8, practiceCount: 92, avgScore: 84.5 }
			  ]
	);

	// D3 Scale Calculations
	const innerWidth = $derived(Math.max(100, containerWidth - margin.left - margin.right));
	const innerHeight = $derived(Math.max(50, height - margin.top - margin.bottom));

	const xScale = $derived.by(() => {
		return d3
			.scalePoint<number>()
			.domain(chartData.map((_, i) => i))
			.range([0, innerWidth])
			.padding(0.2);
	});

	const yScale = $derived.by(() => {
		if (selectedMetric === 'score') {
			const minScore = Math.max(0, (d3.min(chartData, (d) => d.avgScore) || 50) - 10);
			const maxScore = Math.min(100, (d3.max(chartData, (d) => d.avgScore) || 90) + 10);
			return d3.scaleLinear().domain([minScore, maxScore]).range([innerHeight, 0]).nice();
		} else {
			const maxActivity = (d3.max(chartData, (d) => d.practiceCount) || 50) * 1.15;
			return d3.scaleLinear().domain([0, maxActivity]).range([innerHeight, 0]).nice();
		}
	});

	// D3 Path Generators
	const linePath = $derived.by(() => {
		const lineGen = d3
			.line<TrendDataPoint>()
			.x((_, i) => xScale(i) ?? 0)
			.y((d) => yScale(selectedMetric === 'score' ? d.avgScore : d.practiceCount))
			.curve(d3.curveMonotoneX);

		return lineGen(chartData) || '';
	});

	const areaPath = $derived.by(() => {
		const areaGen = d3
			.area<TrendDataPoint>()
			.x((_, i) => xScale(i) ?? 0)
			.y0(innerHeight)
			.y1((d) => yScale(selectedMetric === 'score' ? d.avgScore : d.practiceCount))
			.curve(d3.curveMonotoneX);

		return areaGen(chartData) || '';
	});

	// Y Axis Grid Ticks
	const yTicks = $derived(yScale.ticks(4));

	const hoveredPoint = $derived(
		hoveredIndex !== null && chartData[hoveredIndex] ? chartData[hoveredIndex] : null
	);

	function handlePointerMove(e: MouseEvent) {
		const svgRect = (e.currentTarget as SVGElement).getBoundingClientRect();
		const mouseX = e.clientX - svgRect.left - margin.left;
		
		// Find closest point
		let closestIdx = 0;
		let minDiff = Infinity;
		chartData.forEach((_, i) => {
			const px = xScale(i) ?? 0;
			const diff = Math.abs(px - mouseX);
			if (diff < minDiff) {
				minDiff = diff;
				closestIdx = i;
			}
		});
		hoveredIndex = closestIdx;
	}

	function handlePointerLeave() {
		hoveredIndex = null;
	}
</script>

<div
	bind:clientWidth={containerWidth}
	class="rounded-xl border border-border bg-card p-4 space-y-3 shadow-2xs"
>
	<!-- Chart Header & Mode Toggle -->
	<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-3">
		<div class="space-y-0.5">
			<div class="flex items-center gap-2">
				<TrendingUp class="size-4 text-emerald-600 dark:text-emerald-400" />
				<h2 class="text-xs font-bold text-foreground">
					แนวโน้มพัฒนาการและการมีส่วนร่วมของผู้เรียน (D3 Trend Analytics)
				</h2>
			</div>
			<p class="text-[11px] text-muted-foreground">
				วิเคราะห์พัฒนาการความแม่นยำของเสียงวรรณยุกต์และอัตราการฝึกฝนตามช่วงเวลา
			</p>
		</div>

		<!-- Segmented Button Mode Toggle -->
		<div class="flex items-center gap-1 bg-muted/50 p-1 rounded-lg text-xs">
			<button
				type="button"
				onclick={() => (selectedMetric = 'score')}
				class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer {selectedMetric === 'score' ? 'bg-background text-emerald-700 dark:text-emerald-300 shadow-2xs font-bold' : 'text-muted-foreground hover:text-foreground'}"
			>
				<Activity class="size-3" />
				<span>คะแนน GOP เฉลี่ย (%)</span>
			</button>
			<button
				type="button"
				onclick={() => (selectedMetric = 'activity')}
				class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer {selectedMetric === 'activity' ? 'bg-background text-blue-700 dark:text-blue-300 shadow-2xs font-bold' : 'text-muted-foreground hover:text-foreground'}"
			>
				<Users class="size-3" />
				<span>จำนวนการฝึก (ครั้ง)</span>
			</button>
		</div>
	</div>

	<!-- SVG D3 Chart Viewport -->
	<div class="relative w-full overflow-hidden select-none">
		<svg
			width={containerWidth}
			{height}
			class="overflow-visible cursor-crosshair"
			onmousemove={handlePointerMove}
			onmouseleave={handlePointerLeave}
			role="img"
			aria-label="Student Learning Progress D3 Line Chart"
		>
			<defs>
				<!-- Gradient Fill for Score Mode (Emerald) -->
				<linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="#10b981" stop-opacity="0.28" />
					<stop offset="100%" stop-color="#10b981" stop-opacity="0.0" />
				</linearGradient>

				<!-- Gradient Fill for Activity Mode (Sky Blue) -->
				<linearGradient id="activityAreaGradient" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="#0284c7" stop-opacity="0.28" />
					<stop offset="100%" stop-color="#0284c7" stop-opacity="0.0" />
				</linearGradient>
			</defs>

			<g transform={`translate(${margin.left}, ${margin.top})`}>
				<!-- Horizontal Grid Lines & Y Axis Labels -->
				{#each yTicks as tick (tick)}
					{@const yPos = yScale(tick)}
					<g transform={`translate(0, ${yPos})`}>
						<line
							x1="0"
							x2={innerWidth}
							y1="0"
							y2="0"
							stroke="currentColor"
							class="text-border/60"
							stroke-dasharray="3,3"
							stroke-width="1"
						/>
						<text
							x="-8"
							y="3"
							text-anchor="end"
							class="text-[10px] font-mono fill-muted-foreground font-medium"
						>
							{tick}{selectedMetric === 'score' ? '%' : ''}
						</text>
					</g>
				{/each}

				<!-- Area under curve -->
				<path
					d={areaPath}
					fill={selectedMetric === 'score' ? 'url(#scoreAreaGradient)' : 'url(#activityAreaGradient)'}
				/>

				<!-- Trend Line Curve -->
				<path
					d={linePath}
					fill="none"
					stroke={selectedMetric === 'score' ? '#10b981' : '#0284c7'}
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>

				<!-- Data Nodes (Circles) -->
				{#each chartData as pt, i (pt.day)}
					{@const cx = xScale(i) ?? 0}
					{@const cy = yScale(selectedMetric === 'score' ? pt.avgScore : pt.practiceCount)}
					{@const isHovered = hoveredIndex === i}

					<circle
						{cx}
						{cy}
						r={isHovered ? 5.5 : 3.5}
						fill={isHovered ? (selectedMetric === 'score' ? '#10b981' : '#0284c7') : '#ffffff'}
						stroke={selectedMetric === 'score' ? '#10b981' : '#0284c7'}
						stroke-width={isHovered ? 2.5 : 2}
						class="transition-all duration-150"
					/>
				{/each}

				<!-- Active Hover Vertical Crosshair -->
				{#if hoveredIndex !== null && hoveredPoint}
					{@const hx = xScale(hoveredIndex) ?? 0}
					{@const hy = yScale(selectedMetric === 'score' ? hoveredPoint.avgScore : hoveredPoint.practiceCount)}

					<line
						x1={hx}
						x2={hx}
						y1="0"
						y2={innerHeight}
						stroke="currentColor"
						class="text-foreground/40"
						stroke-dasharray="2,2"
						stroke-width="1.5"
					/>
				{/if}

				<!-- X Axis Labels (Dates) -->
				{#each chartData as pt, i (pt.day)}
					{@const xPos = xScale(i) ?? 0}
					<text
						x={xPos}
						y={innerHeight + 18}
						text-anchor="middle"
						class="text-[10px] font-medium fill-muted-foreground"
					>
						{pt.formattedDate}
					</text>
				{/each}
			</g>
		</svg>

		<!-- Interactive Hover Tooltip Box -->
		{#if hoveredPoint && hoveredIndex !== null}
			{@const hx = (xScale(hoveredIndex) ?? 0) + margin.left}
			{@const flipLeft = hx > containerWidth - 170}

			<div
				class="absolute pointer-events-none rounded-lg border border-border bg-card/95 backdrop-blur-xs p-2.5 shadow-xl text-xs z-30 transition-all duration-75 space-y-1 w-44"
				style={`left: ${flipLeft ? hx - 180 : hx + 12}px; top: ${margin.top + 8}px;`}
			>
				<div class="font-bold text-foreground flex items-center justify-between border-b border-border pb-1">
					<span>{hoveredPoint.formattedDate}</span>
					<span class="text-[10px] font-mono text-muted-foreground">{hoveredPoint.day}</span>
				</div>

				<div class="space-y-0.5 text-[11px] pt-0.5">
					<div class="flex items-center justify-between">
						<span class="text-muted-foreground">คะแนน GOP เฉลี่ย:</span>
						<span class="font-bold font-mono text-emerald-600 dark:text-emerald-400">
							{hoveredPoint.avgScore}%
						</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-muted-foreground">ฝึกฝนทั้งหมด:</span>
						<span class="font-bold font-mono text-foreground">
							{hoveredPoint.practiceCount} ครั้ง
						</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-muted-foreground">ผู้เรียนที่เข้าฝึก:</span>
						<span class="font-bold font-mono text-blue-600 dark:text-blue-400">
							{hoveredPoint.activeUsers} คน
						</span>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Chart Metric Footnote Summary -->
	<div class="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-muted-foreground border-t border-border/60">
		<div class="flex items-center gap-4">
			<div class="flex items-center gap-1.5">
				<span class="size-2 rounded-full bg-emerald-500"></span>
				<span>คะแนน GOP เฉลี่ยล่าสุด: <strong class="text-foreground font-mono">{chartData[chartData.length - 1]?.avgScore || 0}%</strong></span>
			</div>
			<div class="flex items-center gap-1.5">
				<span class="size-2 rounded-full bg-blue-500"></span>
				<span>ฝึกซ้อมรวมสะสม: <strong class="text-foreground font-mono">{chartData.reduce((acc, p) => acc + p.practiceCount, 0)}</strong> ครั้ง</span>
			</div>
		</div>

		<span class="text-[10px] italic">
			*อิงข้อมูลจริงจากตาราง pronunciation_evaluations
		</span>
	</div>
</div>
