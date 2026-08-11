import React, { useState } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Home, Trophy, Coins, Award, Share2, Check } from 'lucide-react';
import { sfx } from '../utils/audio';

interface GameOverModalProps {
  score: number;
  highScore: number;
  sessionCoins: number;
  totalCoins: number;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  sessionCoins,
  totalCoins,
  onRestart,
  onHome,
}) => {
  const [copied, setCopied] = useState(false);

  // Determine Medal
  let medal: { name: string; color: string; bg: string; border: string } | null = null;
  if (score >= 100) {
    medal = { name: 'PLATINUM', color: 'text-cyan-300', bg: 'bg-cyan-500/20', border: 'border-cyan-400' };
  } else if (score >= 50) {
    medal = { name: 'GOLD', color: 'text-amber-300', bg: 'bg-amber-500/20', border: 'border-amber-400' };
  } else if (score >= 25) {
    medal = { name: 'SILVER', color: 'text-slate-300', bg: 'bg-slate-400/20', border: 'border-slate-300' };
  } else if (score >= 10) {
    medal = { name: 'BRONZE', color: 'text-amber-600', bg: 'bg-amber-800/20', border: 'border-amber-700' };
  }

  const isNewHighScore = score > 0 && score >= highScore;

  const handleShare = () => {
    sfx.playClick();
    const text = `I scored ${score} in Flappy Bird! Can you beat my high score? 🚀`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-950/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        className="w-full max-w-sm bg-white/30 backdrop-blur-xl border-2 border-white/50 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-sky-950 relative overflow-hidden"
      >
        {/* Top Header */}
        <div className="text-center mb-4">
          <h2 className="text-4xl font-black uppercase tracking-tight text-rose-600 drop-shadow-[0_2px_0_rgba(0,0,0,0.15)] italic">
            GAME OVER
          </h2>
          {isNewHighScore && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mt-1.5 inline-block px-3 py-1 rounded-full bg-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider animate-bounce shadow-md border-b-2 border-yellow-600"
            >
              🎉 NEW HIGH SCORE!
            </motion.div>
          )}
        </div>

        {/* Score Card Box */}
        <div className="w-full bg-white/40 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-sm space-y-4 mb-5">
          {/* Medal & Score Grid */}
          <div className="flex items-center justify-between">
            {/* Medal */}
            <div className="flex flex-col items-center">
              <div className="text-[10px] font-black text-sky-900/70 uppercase tracking-wider mb-1">Medal</div>
              {medal ? (
                <div
                  className={`w-12 h-12 rounded-2xl ${medal.bg} ${medal.border} border-2 flex items-center justify-center shadow-md`}
                >
                  <Award className={`w-7 h-7 ${medal.color}`} />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-white/30 border border-white/50 flex items-center justify-center text-slate-500 text-xs font-bold">
                  None
                </div>
              )}
              <span className={`text-[10px] font-black uppercase mt-1 ${medal ? medal.color : 'text-slate-500'}`}>
                {medal ? medal.name : '-'}
              </span>
            </div>

            {/* Scores */}
            <div className="flex flex-col items-end gap-1.5">
              <div>
                <span className="text-[10px] font-black text-sky-900/70 uppercase tracking-wider block">Score</span>
                <span className="text-3xl font-black font-mono text-sky-950">{score}</span>
              </div>
              <div>
                <span className="text-[10px] font-black text-sky-900/70 uppercase tracking-wider block">Best</span>
                <span className="text-xl font-black font-mono text-amber-700">{highScore}</span>
              </div>
            </div>
          </div>

          {/* Session Coins */}
          <div className="pt-3 border-t border-sky-900/10 flex items-center justify-between text-xs font-black">
            <span className="text-sky-900/80 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-600" /> Stars Collected
            </span>
            <span className="text-amber-700 font-mono text-sm">+{sessionCoins}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <motion.button
            id="restart-game-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              sfx.playClick();
              onRestart();
            }}
            className="w-full py-3.5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-lg uppercase tracking-wider shadow-lg border-b-4 border-yellow-600 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            PLAY AGAIN
          </motion.button>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="home-menu-btn"
              onClick={() => {
                sfx.playClick();
                onHome();
              }}
              className="py-2.5 rounded-xl bg-white/50 hover:bg-white/70 text-sky-950 font-black text-xs uppercase tracking-wider border border-white/60 flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
            >
              <Home className="w-4 h-4" /> Menu
            </button>

            <button
              id="share-score-btn"
              onClick={handleShare}
              className="py-2.5 rounded-xl bg-white/50 hover:bg-white/70 text-sky-950 font-black text-xs uppercase tracking-wider border border-white/60 flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Share'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
