import React, { useRef, useEffect } from 'react';
import { PitchPoint, ToneNumber, TONE_PROFILES, SyllableInfo } from '../lib/pitch';

interface PitchVisualizerProps {
  points: PitchPoint[];
  targetTone?: ToneNumber;
  syllables?: SyllableInfo[];
  showTargetCurve?: boolean;
  isLive?: boolean;
  currentHz?: number;
  height?: number;
}

export const PitchVisualizer: React.FC<PitchVisualizerProps> = ({
  points = [],
  targetTone = 1,
  syllables,
  showTargetCurve = true,
  isLive = false,
  currentHz = 0,
  height = 240
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 600;
    const canvasHeight = height;

    canvas.width = width * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, canvasHeight);

    const padding = { top: 28, bottom: 26, left: 36, right: 62 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = canvasHeight - padding.top - padding.bottom;

    // 1. Draw Background & Chao 5-level grid
    ctx.fillStyle = '#090d16'; // Deep slate dark mode
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(0, 0, width, canvasHeight, 16);
    } else {
      ctx.rect(0, 0, width, canvasHeight);
    }
    ctx.fill();

    // Chao scale levels (5 down to 1)
    const levels = [
      { lvl: 5, label: '5 高 High', sub: '~280Hz' },
      { lvl: 4, label: '4 半高 Mid-High', sub: '~220Hz' },
      { lvl: 3, label: '3 中 Mid', sub: '~170Hz' },
      { lvl: 2, label: '2 半低 Mid-Low', sub: '~130Hz' },
      { lvl: 1, label: '1 低 Low', sub: '~95Hz' }
    ];

    ctx.lineWidth = 1;
    levels.forEach((l, idx) => {
      const y = padding.top + (idx / 4) * graphHeight;

      // Horizontal grid line
      ctx.strokeStyle = idx === 0 || idx === 4 ? 'rgba(148, 163, 184, 0.25)' : 'rgba(148, 163, 184, 0.12)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + graphWidth, y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Left Label (Level 5-1)
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px ui-sans-serif, system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${l.lvl}`, padding.left - 8, y + 3.5);

      // Right Label (Hz estimate)
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'left';
      ctx.font = '9px monospace';
      ctx.fillText(l.sub, padding.left + graphWidth + 8, y + 3.5);
    });

    // 2. Draw Target Tone Curve(s)
    if (showTargetCurve) {
      const activeSyllables = syllables && syllables.length > 0 ? syllables : undefined;

      if (activeSyllables && activeSyllables.length > 1) {
        // Multi-syllable target curve rendering
        const sylCount = activeSyllables.length;
        const sylWidth = graphWidth / sylCount;

        for (let k = 0; k < sylCount; k++) {
          const syl = activeSyllables[k];
          const secLeft = padding.left + k * sylWidth;
          const innerPad = 12;
          const curveWidth = sylWidth - innerPad * 2;
          const profile = TONE_PROFILES[syl.surfaceTone] || TONE_PROFILES[1];
          const curve = profile.curve;

          // Vertical separator line between syllables
          if (k > 0) {
            ctx.save();
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.28)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(secLeft, padding.top - 6);
            ctx.lineTo(secLeft, padding.top + graphHeight + 4);
            ctx.stroke();
            ctx.restore();
          }

          // Syllable header tag
          ctx.save();
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 10px ui-sans-serif, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(
            `พยางค์ ${k + 1}: ${syl.hanzi} (${syl.pinyin}) ${profile.thaiName}`,
            secLeft + sylWidth / 2,
            padding.top - 8
          );
          ctx.restore();

          // Syllable Target curve
          ctx.save();
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
          ctx.lineWidth = 3.5;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          for (let i = 0; i < curve.length; i++) {
            const x = secLeft + innerPad + (i / (curve.length - 1)) * curveWidth;
            const normY = (5 - curve[i]) / 4;
            const y = padding.top + normY * graphHeight;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.restore();
        }
      } else {
        // Single target tone
        const activeTone = targetTone || (activeSyllables && activeSyllables[0]?.surfaceTone);
        if (activeTone && TONE_PROFILES[activeTone]) {
          const profile = TONE_PROFILES[activeTone];
          const curve = profile.curve;
          ctx.save();
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          for (let i = 0; i < curve.length; i++) {
            const x = padding.left + (i / (curve.length - 1)) * graphWidth;
            const normY = (5 - curve[i]) / 4;
            const y = padding.top + normY * graphHeight;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.setLineDash([]);

          // Label target
          ctx.fillStyle = '#38bdf8';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(
            `Target: ${profile.thaiName} (${profile.chaoPitch})`,
            padding.left + graphWidth * 0.5,
            padding.top - 8
          );
          ctx.restore();
        }
      }
    }

    // 3. Draw User Pitch Points (F0 Contour)
    const voicedPoints = points.filter((p) => p.f0 > 0 && p.clarity > 0.35);

    if (voicedPoints.length > 1) {
      const minTime = voicedPoints[0].timeMs;
      const maxTime = Math.max(minTime + 800, voicedPoints[voicedPoints.length - 1].timeMs);
      const totalTime = Math.max(1, maxTime - minTime);

      // Glow / Shadow line
      ctx.save();
      ctx.strokeStyle = '#34d399'; // Emerald
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i < voicedPoints.length; i++) {
        const p = voicedPoints[i];
        const ratioX = (p.timeMs - minTime) / totalTime;
        const x = padding.left + ratioX * graphWidth;
        const normY = Math.max(0, Math.min(1, (5 - p.chaoLevel) / 4));
        const y = padding.top + normY * graphHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // Draw key indicator dots
      for (let i = 0; i < voicedPoints.length; i += Math.max(1, Math.floor(voicedPoints.length / 8))) {
        const p = voicedPoints[i];
        const ratioX = (p.timeMs - minTime) / totalTime;
        const x = padding.left + ratioX * graphWidth;
        const normY = Math.max(0, Math.min(1, (5 - p.chaoLevel) / 4));
        const y = padding.top + normY * graphHeight;
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw cursor at the latest point if live
      if (isLive && voicedPoints.length > 0) {
        const last = voicedPoints[voicedPoints.length - 1];
        const ratioX = (last.timeMs - minTime) / totalTime;
        const x = padding.left + ratioX * graphWidth;
        const normY = Math.max(0, Math.min(1, (5 - last.chaoLevel) / 4));
        const y = padding.top + normY * graphHeight;
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (voicedPoints.length === 1) {
      const p = voicedPoints[0];
      const x = padding.left + graphWidth / 2;
      const normY = Math.max(0, Math.min(1, (5 - p.chaoLevel) / 4));
      const y = padding.top + normY * graphHeight;
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Empty state hint
      ctx.fillStyle = '#64748b';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        isLive ? 'กำลังฟังเสียง... พูดคำภาษาจีนเพื่อดูกราฟระดับเสียง F0' : 'กดปุ่มไมโครโฟนเพื่อเริ่มบันทึกและวัดระดับเสียง F0',
        padding.left + graphWidth / 2,
        padding.top + graphHeight / 2 + 4
      );
    }

    // 4. Live HUD Overlay (Bottom-left Hz & status)
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    if (currentHz > 0) {
      ctx.fillStyle = '#34d399';
      ctx.fillText(`⚡ F0: ${Math.round(currentHz)} Hz`, padding.left, canvasHeight - 10);
    } else {
      ctx.fillText('Pitch Engine: YIN Algorithm (F0 Realtime)', padding.left, canvasHeight - 10);
    }
  }, [points, targetTone, syllables, showTargetCurve, isLive, currentHz, height]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border/80 bg-slate-950 p-2 shadow-inner">
      <canvas
        ref={canvasRef}
        style={{ height: `${height}px`, width: '100%' }}
        className="block touch-none"
      />
    </div>
  );
};
