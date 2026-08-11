import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Volume2,
  VolumeX,
  Trophy,
  Sparkles,
  Zap,
  Moon,
  Sun,
  Sunset,
  Lock,
  Coins,
  Check,
  Gamepad2,
  Info,
} from 'lucide-react';
import { GameSettings, BirdSkin, Difficulty, Theme } from '../types';
import { SKINS } from '../data/skins';
import { drawBird } from '../utils/canvasRenderer';
import { sfx } from '../utils/audio';

interface StartScreenProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onStartGame: () => void;
  highScore: number;
  coins: number;
  unlockedSkinIds: string[];
  onUnlockSkin: (skinId: string, cost: number) => boolean;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  settings,
  onUpdateSettings,
  onStartGame,
  highScore,
  coins,
  unlockedSkinIds,
  onUnlockSkin,
}) => {
  const [activeTab, setActiveTab] = useState<'PLAY' | 'SKINS' | 'SETTINGS' | 'HELP'>('PLAY');
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const selectedSkin = SKINS.find((s) => s.id === settings.skinId) || SKINS[0];

  // Animated Bird Preview in Menu
  useEffect(() => {
    let animId: number;
    let wingTime = 0;

    const renderPreview = () => {
      const canvas = previewCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      wingTime += 0.15;
      const wingPos = Math.sin(wingTime);
      const floatY = canvas.height / 2 + Math.sin(wingTime * 0.5) * 6;

      drawBird(ctx, canvas.width / 2, floatY, 0, selectedSkin, wingPos, 1.3);

      animId = requestAnimationFrame(renderPreview);
    };

    renderPreview();
    return () => cancelAnimationFrame(animId);
  }, [selectedSkin]);

  const handleStart = () => {
    sfx.playClick();
    onStartGame();
  };

  const handleDifficultySelect = (diff: Difficulty) => {
    sfx.playClick();
    onUpdateSettings({ difficulty: diff });
  };

  const handleThemeSelect = (theme: Theme) => {
    sfx.playClick();
    onUpdateSettings({ theme });
  };

  const handleSoundToggle = () => {
    const nextSound = !settings.soundEnabled;
    sfx.enabled = nextSound;
    if (nextSound) sfx.playScore();
    onUpdateSettings({ soundEnabled: nextSound });
  };

  return (
    <div className="relative z-10 w-full max-w-xl mx-auto px-4 py-4 flex flex-col items-center">
      {/* Top Bar: High Score & Total Coins */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full flex items-center justify-between bg-white/20 backdrop-blur-md rounded-2xl p-3 border border-white/30 shadow-lg mb-4 text-sky-950"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-yellow-400 text-slate-900 border border-yellow-500 shadow-sm">
            <Trophy className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="text-[10px] text-sky-900/70 uppercase tracking-widest font-black">Best Score</div>
            <div className="text-xl font-black text-sky-950 font-mono">{highScore}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-yellow-400/30 px-3.5 py-2 rounded-xl border border-yellow-400/50 shadow-sm">
            <Coins className="w-5 h-5 text-amber-600 animate-bounce" />
            <span className="font-black font-mono text-sky-950 text-base">{coins}</span>
          </div>

          <button
            id="sound-toggle-btn"
            onClick={handleSoundToggle}
            className="p-2.5 rounded-xl bg-white/40 hover:bg-white/60 text-sky-900 transition-colors border border-white/50 cursor-pointer shadow-sm"
            title={settings.soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
          >
            {settings.soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-700" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
          </button>
        </div>
      </motion.div>

      {/* Hero Arcade Title - Sleek Glass Title Block */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="text-center my-2"
      >
        <div className="bg-white/20 backdrop-blur-md px-8 py-3.5 rounded-3xl border border-white/30 shadow-2xl inline-block relative">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-[0_4px_0_rgba(0,0,0,0.2)] uppercase italic">
            FLAPPY<span className="text-yellow-400">BIRD</span>
          </h1>
          <div className="absolute -right-3 -top-3">
            <Sparkles className="w-7 h-7 text-yellow-300 animate-pulse drop-shadow" />
          </div>
        </div>
        <p className="text-xs md:text-sm font-black text-sky-900/70 tracking-[0.2em] uppercase mt-2 drop-shadow-sm">
          The Original Endless Flight
        </p>
      </motion.div>

      {/* Character Preview Canvas Box */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="my-3 relative flex flex-col items-center"
      >
        <div className="w-28 h-28 rounded-3xl bg-white/30 backdrop-blur-md border-2 border-white/50 shadow-2xl flex items-center justify-center p-2 relative overflow-hidden group">
          <canvas ref={previewCanvasRef} width={100} height={100} className="w-full h-full" />
          <div className="absolute bottom-1.5 text-[10px] font-black uppercase tracking-wider text-slate-900 bg-yellow-400/90 px-2.5 py-0.5 rounded-full border border-yellow-500 shadow-sm">
            {selectedSkin.name}
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="w-full bg-white/20 backdrop-blur-md rounded-2xl p-1.5 border border-white/30 shadow-lg mb-4 flex gap-1">
        <button
          id="tab-play-btn"
          onClick={() => {
            sfx.playClick();
            setActiveTab('PLAY');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase ${
            activeTab === 'PLAY'
              ? 'bg-yellow-400 text-slate-950 shadow-md font-black border-b-2 border-yellow-600'
              : 'text-sky-950/80 hover:text-sky-950 hover:bg-white/30'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          Play
        </button>

        <button
          id="tab-skins-btn"
          onClick={() => {
            sfx.playClick();
            setActiveTab('SKINS');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase ${
            activeTab === 'SKINS'
              ? 'bg-yellow-400 text-slate-950 shadow-md font-black border-b-2 border-yellow-600'
              : 'text-sky-950/80 hover:text-sky-950 hover:bg-white/30'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Skins
        </button>

        <button
          id="tab-settings-btn"
          onClick={() => {
            sfx.playClick();
            setActiveTab('SETTINGS');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase ${
            activeTab === 'SETTINGS'
              ? 'bg-yellow-400 text-slate-950 shadow-md font-black border-b-2 border-yellow-600'
              : 'text-sky-950/80 hover:text-sky-950 hover:bg-white/30'
          }`}
        >
          <Zap className="w-4 h-4" />
          Settings
        </button>

        <button
          id="tab-help-btn"
          onClick={() => {
            sfx.playClick();
            setActiveTab('HELP');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase ${
            activeTab === 'HELP'
              ? 'bg-yellow-400 text-slate-950 shadow-md font-black border-b-2 border-yellow-600'
              : 'text-sky-950/80 hover:text-sky-950 hover:bg-white/30'
          }`}
        >
          <Info className="w-4 h-4" />
          Help
        </button>
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        {activeTab === 'PLAY' && (
          <motion.div
            key="play-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full flex flex-col items-center gap-4"
          >
            {/* Mode selector */}
            <div className="w-full bg-white/20 backdrop-blur-md rounded-2xl p-3 border border-white/30 flex items-center justify-between gap-2 shadow-sm">
              <span className="text-xs text-sky-900 font-extrabold uppercase tracking-wider pl-2">Difficulty</span>
              <div className="flex gap-1.5">
                {(['EASY', 'NORMAL', 'HARD'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    id={`diff-btn-${d.toLowerCase()}`}
                    onClick={() => handleDifficultySelect(d)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      settings.difficulty === d
                        ? 'bg-yellow-400 text-slate-950 font-black shadow-md border-b-2 border-yellow-600'
                        : 'bg-white/30 text-sky-950/80 hover:bg-white/50'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Sleek Theme 3D Start Button */}
            <motion.button
              id="start-game-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleStart}
              className="w-full relative bg-yellow-400 hover:bg-yellow-300 border-b-8 border-yellow-600 active:border-b-0 active:translate-y-2 py-4 rounded-2xl flex items-center justify-center gap-4 shadow-xl cursor-pointer group transition-all"
            >
              <span className="text-3xl font-black text-white uppercase italic tracking-wider drop-shadow-[0_2px_0_rgba(0,0,0,0.3)]">
                START GAME
              </span>
              <Play className="w-8 h-8 text-white fill-current drop-shadow group-hover:scale-110 transition-transform" />
            </motion.button>

            <div className="text-xs text-sky-950 font-extrabold flex items-center gap-2 bg-white/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/40 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              Click mouse or press <kbd className="bg-yellow-400 text-slate-900 px-1.5 py-0.5 rounded font-mono font-black">SPACE</kbd> to flap
            </div>
          </motion.div>
        )}

        {activeTab === 'SKINS' && (
          <motion.div
            key="skins-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30 shadow-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black text-sky-950 uppercase tracking-widest">Bird Skin Workshop</h3>
              <span className="text-xs text-sky-900/70 font-extrabold">Collect stars to unlock</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SKINS.map((skin) => {
                const isUnlocked = unlockedSkinIds.includes(skin.id) || skin.price === 0;
                const isSelected = settings.skinId === skin.id;

                return (
                  <div
                    key={skin.id}
                    className={`relative p-3 rounded-2xl border flex flex-col items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-yellow-400/30 border-yellow-500 shadow-md'
                        : isUnlocked
                        ? 'bg-white/30 border-white/40 hover:bg-white/50'
                        : 'bg-white/10 border-white/20 opacity-70'
                    }`}
                  >
                    {/* Skin Color Dot Indicator */}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2 shadow-inner border-2 border-white" style={{ backgroundColor: skin.color }}>
                      <div className="w-4 h-4 rounded-full border border-black/30" style={{ backgroundColor: skin.wingColor }} />
                    </div>

                    <div className="text-xs font-black text-sky-950 text-center mb-2">{skin.name}</div>

                    {isSelected ? (
                      <span className="w-full py-1.5 rounded-xl bg-yellow-400 text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 border-b-2 border-yellow-600 shadow-sm">
                        <Check className="w-3.5 h-3.5" /> Equipped
                      </span>
                    ) : isUnlocked ? (
                      <button
                        id={`select-skin-${skin.id}`}
                        onClick={() => {
                          sfx.playClick();
                          onUpdateSettings({ skinId: skin.id });
                        }}
                        className="w-full py-1.5 rounded-xl bg-white/60 hover:bg-white/80 text-sky-950 font-black text-[11px] transition-colors cursor-pointer border border-white/50 shadow-sm"
                      >
                        Equip
                      </button>
                    ) : (
                      <button
                        id={`unlock-skin-${skin.id}`}
                        onClick={() => {
                          const success = onUnlockSkin(skin.id, skin.price);
                          if (success) {
                            sfx.playCoin();
                            onUpdateSettings({ skinId: skin.id });
                          } else {
                            sfx.playHit();
                          }
                        }}
                        disabled={coins < skin.price}
                        className={`w-full py-1.5 rounded-xl font-black text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-sm ${
                          coins >= skin.price
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-white border-b-2 border-emerald-700'
                            : 'bg-slate-300/50 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Lock className="w-3 h-3" />
                        {skin.price} <Coins className="w-3 h-3 text-amber-600" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'SETTINGS' && (
          <motion.div
            key="settings-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30 shadow-xl space-y-4"
          >
            {/* Difficulty Setting */}
            <div>
              <label className="text-xs font-black text-sky-950 uppercase tracking-wider block mb-2">Game Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {(['EASY', 'NORMAL', 'HARD'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    id={`setting-diff-${d}`}
                    onClick={() => handleDifficultySelect(d)}
                    className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      settings.difficulty === d
                        ? 'bg-yellow-400 text-slate-950 shadow-md border-b-2 border-yellow-600'
                        : 'bg-white/30 text-sky-950 hover:bg-white/50'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Setting */}
            <div>
              <label className="text-xs font-black text-sky-950 uppercase tracking-wider block mb-2">Environment Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'DAY', label: 'Day Sky', icon: Sun },
                  { id: 'SUNSET', label: 'Sunset', icon: Sunset },
                  { id: 'NIGHT', label: 'Night', icon: Moon },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      id={`setting-theme-${t.id}`}
                      onClick={() => handleThemeSelect(t.id as Theme)}
                      className={`py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        settings.theme === t.id
                          ? 'bg-yellow-400 text-slate-950 shadow-md border-b-2 border-yellow-600'
                          : 'bg-white/30 text-sky-950 hover:bg-white/50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'HELP' && (
          <motion.div
            key="help-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30 shadow-xl space-y-3 text-sky-950"
          >
            <h3 className="text-xs font-black text-sky-950 uppercase tracking-wider flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" /> How to Play
            </h3>

            <ul className="text-xs space-y-2 text-sky-900 font-semibold">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-black">•</span>
                <span><strong>Flap Controls:</strong> Click mouse or hit <kbd className="bg-yellow-400 text-slate-900 px-1 rounded font-mono font-bold">SPACE</kbd> / <kbd className="bg-yellow-400 text-slate-900 px-1 rounded font-mono font-bold">UP</kbd> to flap.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-black">•</span>
                <span><strong>Pipes & Obstacles:</strong> Fly between green pipes without hitting top, bottom, or floor.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-black">•</span>
                <span><strong>Collect Stars:</strong> Collect gold stars inside gaps to buy cool bird skins!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-black">•</span>
                <span><strong>Earn Medals:</strong> Unlock Bronze (10+), Silver (25+), Gold (50+), and Platinum (100+) medals!</span>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
