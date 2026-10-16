import React, { useState } from 'react';
import {
  Flame,
  Zap,
  Heart,
  Settings as SettingsIcon,
  ArrowLeft,
  User,
  Shield,
  BarChart2,
  BookOpen,
  Volume2,
  TrendingUp,
  MessageCircle,
  Menu,
  X
} from 'lucide-react';
import { useProgress } from '../lib/progressStore';
import { useSettings, MODELS, ModelId } from '../lib/settingsStore';

interface AppHeaderProps {
  showBack?: boolean;
  onBack?: () => void;
  currentRoute?: string;
  navigate?: (route: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  showBack = false,
  onBack,
  currentRoute = 'home',
  navigate
}) => {
  const { streak, xp, hearts } = useProgress();
  const { apiKey, modelId, user, setApiKey, setModelId } = useSettings();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [keyDraft, setKeyDraft] = useState(apiKey);
  const [modelDraft, setModelDraft] = useState<ModelId>(modelId);

  const openSettings = () => {
    setKeyDraft(apiKey);
    setModelDraft(modelId);
    setSettingsOpen(true);
  };

  const saveSettings = () => {
    setApiKey(keyDraft);
    setModelId(modelDraft);
    setSettingsOpen(false);
  };

  const handleNav = (target: string) => {
    if (navigate) {
      navigate(target);
    } else {
      window.location.hash = target;
    }
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 py-2.5">
          <div className="flex items-center gap-2">
            {showBack && (
              <button
                type="button"
                onClick={onBack ? onBack : () => handleNav('home')}
                className="flex size-9 items-center justify-center rounded-xl border border-border bg-card text-foreground transition hover:bg-muted active:scale-95 cursor-pointer"
                aria-label="ย้อนกลับ"
              >
                <ArrowLeft className="size-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => handleNav('home')}
              className="flex items-center gap-2 text-left font-extrabold tracking-tight cursor-pointer"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-lg font-black text-white shadow-sm">
                語
              </span>
              <div className="leading-tight">
                <span className="text-base font-black text-foreground">ปากจีน</span>
                <span className="hidden sm:inline-block ml-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                  HSK Coach
                </span>
              </div>
            </button>
          </div>

          {/* Quick nav links for desktop */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-bold text-muted-foreground">
            <button
              type="button"
              onClick={() => handleNav('home')}
              className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                currentRoute === 'home' ? 'bg-primary/10 text-primary font-black' : 'hover:bg-muted text-foreground/80'
              }`}
            >
              เควสต์ HSK
            </button>
            <button
              type="button"
              onClick={() => handleNav('pitch')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                currentRoute === 'pitch' ? 'bg-primary/10 text-primary font-black' : 'hover:bg-muted text-foreground/80'
              }`}
            >
              <TrendingUp className="size-3.5" />
              ฝึกออกเสียง & Pitch
            </button>
            <button
              type="button"
              onClick={() => handleNav('talk')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                currentRoute.startsWith('talk') ? 'bg-primary/10 text-primary font-black' : 'hover:bg-muted text-foreground/80'
              }`}
            >
              <MessageCircle className="size-3.5" />
              สนทนา AI
            </button>
            <button
              type="button"
              onClick={() => handleNav('lessons')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                currentRoute.startsWith('lesson') ? 'bg-primary/10 text-primary font-black' : 'hover:bg-muted text-foreground/80'
              }`}
            >
              <BookOpen className="size-3.5" />
              บทเรียน
            </button>
          </nav>

          {/* User Stats & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold">
            <div
              className="flex items-center gap-1 text-orange-500 bg-orange-500/10 px-2 py-1 rounded-full"
              title="สตรีคการฝึกต่อเนื่อง (วัน)"
            >
              <Flame className="size-4 fill-orange-500" />
              <span>{streak}</span>
            </div>
            <div
              className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full"
              title="ค่าประสบการณ์ (XP)"
            >
              <Zap className="size-4 fill-amber-400" />
              <span>{xp}</span>
            </div>
            <div
              className="flex items-center gap-1 text-rose-500 bg-rose-500/10 px-2 py-1 rounded-full"
              title="หัวใจ (พลังงานฝึกฝน)"
            >
              <Heart className="size-4 fill-rose-500" />
              <span>{hearts}</span>
            </div>

            <button
              type="button"
              onClick={openSettings}
              className="flex size-8 sm:size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:bg-muted hover:text-foreground cursor-pointer"
              aria-label="ตั้งค่าระบบ"
              title="ตั้งค่าโมเดล AI"
            >
              <SettingsIcon className="size-4" />
            </button>

            {/* Profile / Menu button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex size-8 sm:size-9 items-center justify-center rounded-full bg-emerald-600 text-xs sm:text-sm font-black uppercase text-white shadow-sm hover:opacity-90 transition cursor-pointer"
                aria-label="เมนูผู้ใช้งาน"
              >
                {user?.username ? user.username.charAt(0) : 'U'}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-border bg-card p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-border/60">
                    <div className="text-xs font-bold text-foreground truncate">{user?.username || 'ผู้เรียน'}</div>
                    <div className="text-[10px] text-muted-foreground">ระดับ: แอดมิน / ผู้เรียน</div>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => handleNav('analytics')}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition cursor-pointer"
                    >
                      <BarChart2 className="size-4 text-emerald-600" />
                      <span>วิเคราะห์ผู้เรียน (Analytics)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNav('admin')}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition cursor-pointer"
                    >
                      <Shield className="size-4 text-violet-600" />
                      <span>จัดการระบบ (Admin)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex md:hidden size-8 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-1">
            <button
              type="button"
              onClick={() => handleNav('home')}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-foreground hover:bg-muted"
            >
              <Flame className="size-4 text-orange-500" /> เควสต์ HSK (Journey)
            </button>
            <button
              type="button"
              onClick={() => handleNav('pitch')}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-foreground hover:bg-muted"
            >
              <TrendingUp className="size-4 text-emerald-500" /> วิเคราะห์ระดับเสียง (Pitch & Tone)
            </button>
            <button
              type="button"
              onClick={() => handleNav('talk')}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-foreground hover:bg-muted"
            >
              <MessageCircle className="size-4 text-violet-500" /> สนทนาสถานการณ์จำลอง (AI Talk)
            </button>
            <button
              type="button"
              onClick={() => handleNav('lessons')}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-foreground hover:bg-muted"
            >
              <BookOpen className="size-4 text-sky-500" /> บทเรียนคำศัพท์ (Lessons)
            </button>
            <button
              type="button"
              onClick={() => handleNav('analytics')}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-foreground hover:bg-muted"
            >
              <BarChart2 className="size-4 text-teal-500" /> สถิติ & จุดที่ต้องแก้ไข (Analytics)
            </button>
            <button
              type="button"
              onClick={() => handleNav('admin')}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-foreground hover:bg-muted"
            >
              <Shield className="size-4 text-purple-500" /> คลังคำศัพท์ & ผู้ดูแล (Admin)
            </button>
          </div>
        )}
      </header>

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-lg font-black text-foreground">ตั้งค่า / Settings</h3>
                <p className="text-xs text-muted-foreground">เลือกโมเดล AI ที่ใช้ตรวจการออกเสียงและสนทนา</p>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="flex size-8 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                  โมเดล AI
                </label>
                <div className="space-y-2">
                  {MODELS.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-3 transition ${
                        modelDraft === opt.id
                          ? 'border-emerald-600 bg-emerald-500/5'
                          : 'border-border hover:border-border/80'
                      }`}
                    >
                      <input
                        type="radio"
                        name="model"
                        value={opt.id}
                        checked={modelDraft === opt.id}
                        onChange={() => setModelDraft(opt.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                          {opt.label}
                          <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-normal text-muted-foreground">
                            {opt.provider}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{opt.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-3">
                <label className="text-xs font-bold text-foreground block mb-1">
                  OpenRouter API Key <span className="text-[10px] font-normal text-muted-foreground">(กรณีใช้ Gemini 2.5)</span>
                </label>
                <input
                  type="password"
                  value={keyDraft}
                  onChange={(e) => setKeyDraft(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  ปล่อยว่างเพื่อใช้ระบบประเมินเสียงภายในเบราว์เซอร์และโมเดลเริ่มต้น
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={saveSettings}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm cursor-pointer"
              >
                บันทึกการตั้งค่า
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
