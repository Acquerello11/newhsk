import React, { useState } from 'react';
import {
  Zap,
  Flame,
  TrendingUp,
  MessageCircle,
  BookOpen,
  Sparkles,
  ArrowRight,
  Volume2,
  Mic,
  Lock,
  Star,
  Users,
  Utensils,
  GraduationCap,
  ShoppingBag,
  Compass,
  Clock,
  HeartPulse,
  Briefcase
} from 'lucide-react';
import { useProgress } from '../lib/progressStore';
import { ALL_QUEST_STAGES, QuestStage } from '../lib/data/questLevels';
import { speak } from '../lib/speech';
import { HSK1_VOCAB_PRESETS } from '../lib/vocabLoader';

interface HomeViewProps {
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const { xp, streak, completed, wordStats } = useProgress();
  const [selectedLevel, setSelectedLevel] = useState<number>(1);

  const filteredStages = ALL_QUEST_STAGES.filter((s) => s.hskLevel === selectedLevel);

  function getStageIcon(stage: QuestStage) {
    const t = stage.title;
    if (t.includes('ครอบครัว') || t.includes('บุคคล')) return Users;
    if (t.includes('อาหาร') || t.includes('เครื่องดื่ม')) return Utensils;
    if (t.includes('เรียน') || t.includes('โรงเรียน')) return GraduationCap;
    if (t.includes('ซื้อ') || t.includes('ขาย') || t.includes('ราคา')) return ShoppingBag;
    if (t.includes('เดิน') || t.includes('ทิศทาง') || t.includes('สถานที่')) return Compass;
    if (t.includes('เวลา') || t.includes('วัน') || t.includes('เดือน')) return Clock;
    if (t.includes('สุขภาพ') || t.includes('ร่างกาย')) return HeartPulse;
    if (t.includes('งาน') || t.includes('อาชีพ')) return Briefcase;
    return BookOpen;
  }

  // Generate adaptive remedial recommendations based on user practice or default essentials
  const strugglingList = Object.entries(wordStats)
    .filter(([_, stat]) => stat.status === 'struggling' || stat.wrongCount > 0)
    .map(([id]) => id);

  const remedialWords = (
    strugglingList.length > 0
      ? HSK1_VOCAB_PRESETS.filter((p) => strugglingList.includes(p.id))
      : HSK1_VOCAB_PRESETS.filter(
          (p) =>
            p.hanzi === '你好' ||
            p.hanzi === '谢谢' ||
            p.hanzi === '老师' ||
            p.hanzi === '再见' ||
            p.category === 'sandhi'
        )
  ).slice(0, 3);

  return (
    <main className="mx-auto max-w-xl px-4 pb-28 pt-4">
      {/* Top Quick Status Bar */}
      <div className="mb-6 flex items-center justify-around rounded-2xl border border-border bg-card/90 px-4 py-3 shadow-xs">
        <div className="flex items-center gap-1.5 font-black text-amber-500">
          <Zap className="size-5 fill-amber-400" />
          <span>{xp} XP</span>
        </div>
        <div className="flex items-center gap-1.5 font-black text-orange-500">
          <Flame className="size-5 fill-orange-500" />
          <span>{streak} วันต่อเนื่อง</span>
        </div>
      </div>

      {/* Extra Modes Banner */}
      <div className="mb-8 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onNavigate('pitch')}
          className="group relative text-left overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-4 text-white shadow-lg shadow-emerald-600/20 transition hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <div className="mb-2 flex size-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <TrendingUp className="size-5" />
          </div>
          <div className="text-sm font-black leading-tight">วิเคราะห์การออกเสียง</div>
          <div className="mt-0.5 text-[11px] font-medium text-white/80">Pitch & Tone Detection</div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('talk')}
          className="group relative text-left overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-fuchsia-600 p-4 text-white shadow-lg shadow-violet-600/20 transition hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <div className="mb-2 flex size-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <MessageCircle className="size-5" />
          </div>
          <div className="text-sm font-black leading-tight">สถานการณ์จำลอง</div>
          <div className="mt-0.5 text-[11px] font-medium text-white/80">AI Conversation Practice</div>
        </button>
      </div>

      {/* Adaptive Remedial Recommendations Section */}
      {remedialWords.length > 0 && (
        <section className="mb-8 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-card to-background p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <Sparkles className="size-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-foreground">
                  คำแนะนำซ่อมเสริมเฉพาะคุณ (Adaptive Practice)
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  ระบบคัดเลือกคำศัพท์ที่ควรฝึกซ้ำเพื่อเสริมความแม่นยำของวรรณยุกต์
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('analytics')}
              className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 shrink-0 cursor-pointer"
            >
              สถิติ <ArrowRight className="size-3" />
            </button>
          </div>

          <div className="space-y-2">
            {remedialWords.map((word, idx) => (
              <div
                key={word.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-card p-3 transition hover:border-emerald-500/40 gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-foreground">{word.hanzi}</span>
                      <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">
                        {word.pinyin}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 shrink-0">
                        {word.category === 'sandhi' ? 'Tone Sandhi' : `เสียง ${word.tone}`}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">
                      {word.thai} {word.description ? `• ${word.description}` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => speak(word.hanzi)}
                    className="flex size-8 items-center justify-center rounded-xl border border-border bg-background hover:bg-muted text-foreground transition active:scale-95 cursor-pointer"
                    title="1. ฟังเสียงต้นแบบ"
                  >
                    <Volume2 className="size-3.5 text-emerald-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('pitch', { word: word.hanzi })}
                    className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                    title="2. ฝึกออกเสียงคำนี้"
                  >
                    <Mic className="size-3" />
                    <span>ฝึก</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quest Title */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-black tracking-tight text-foreground">HSK Quest</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ฝึกฝนคำศัพท์และการออกเสียงภาษาจีนด้วยเสียงจริงของคุณ
        </p>
      </div>

      {/* Level Selector Tabs */}
      <div className="mb-8 flex justify-center gap-2">
        {[1, 2, 3].map((lvl) => (
          <button
            key={lvl}
            type="button"
            onClick={() => setSelectedLevel(lvl)}
            className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer ${
              selectedLevel === lvl
                ? 'bg-emerald-600 text-white shadow-md scale-105'
                : 'bg-muted/60 border border-border text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <BookOpen className="size-4" />
            <span>HSK {lvl}</span>
          </button>
        ))}
      </div>

      {/* Journey Map */}
      <div className="relative py-4 flex flex-col items-center">
        {/* Background dashed line */}
        <div className="absolute top-10 bottom-10 left-1/2 -ml-[2px] w-1 border-l-4 border-dashed border-border -z-10" />

        {filteredStages.map((stage, i) => {
          const isUnlocked = i === 0 || (completed[filteredStages[i - 1].id] ?? 0) > 0;
          const stars = completed[stage.id] ?? 0;
          const offset = Math.sin(i * 1.2) * 50;
          const StageIcon = getStageIcon(stage);

          return (
            <div key={stage.id} className="relative my-4 flex w-full justify-center">
              <button
                type="button"
                onClick={() => {
                  if (isUnlocked) {
                    onNavigate('quest', { stageId: stage.id });
                  }
                }}
                className={`group relative flex flex-col items-center transition-transform hover:scale-105 active:scale-95 ${
                  isUnlocked ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'
                }`}
                style={{ transform: `translateX(${offset}px)` }}
                disabled={!isUnlocked}
                aria-label={`ด่าน ${stage.stageIndex} · ${stage.title}`}
              >
                {/* Stage Circle Button with Icon */}
                <div
                  className={`relative grid size-16 place-items-center rounded-full shadow-lg transition-all ${
                    stars === 3
                      ? 'bg-amber-400 text-amber-950 ring-4 ring-amber-400/30'
                      : stars > 0
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/30'
                      : isUnlocked
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/30 shadow-emerald-500/30'
                      : 'bg-muted text-muted-foreground/60 border border-border'
                  }`}
                >
                  {!isUnlocked ? (
                    <Lock className="size-7 shrink-0" />
                  ) : (
                    <>
                      <StageIcon className="size-7 shrink-0" />
                      {stars > 0 && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5 rounded-full bg-background px-1.5 py-0.5 shadow-xs border border-border text-amber-500">
                          {Array.from({ length: stars }).map((_, sIdx) => (
                            <Star key={sIdx} className="size-2.5 fill-current" />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Label Underneath */}
                <div className="mt-2 rounded-xl bg-card px-3 py-1 text-center shadow-xs border border-border group-hover:border-emerald-500/50 transition">
                  <div className="text-xs font-black leading-tight text-foreground whitespace-nowrap">
                    <span className="text-emerald-600 dark:text-emerald-400 font-black">
                      ด่าน {stage.stageIndex}
                    </span>{' '}
                    · {stage.title}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
};
