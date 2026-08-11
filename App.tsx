import { useState, useEffect } from 'react';
import { GameState, GameSettings } from './types';
import { StartScreen } from './components/StartScreen';
import { GameCanvas } from './components/GameCanvas';
import { GameOverModal } from './components/GameOverModal';
import { initializeAdMob, showInterstitialAd } from './utils/admob';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState<number>(0);
  const [sessionCoins, setSessionCoins] = useState<number>(0);

  // Initialize Google Mobile Ads SDK on Native Launch
  useEffect(() => {
    initializeAdMob();
  }, []);

  // Persistent Local Storage State
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('flappy_high_score');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem('flappy_coins');
    return saved ? parseInt(saved, 10) : 10; // Start with 10 bonus starter coins!
  });

  const [unlockedSkinIds, setUnlockedSkinIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('flappy_unlocked_skins');
    return saved ? JSON.parse(saved) : ['classic'];
  });

  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('flappy_settings');
    return saved
      ? JSON.parse(saved)
      : {
          difficulty: 'NORMAL',
          theme: 'DAY',
          skinId: 'classic',
          soundEnabled: true,
        };
  });

  // Save Settings Changes
  useEffect(() => {
    localStorage.setItem('flappy_settings', JSON.stringify(settings));
  }, [settings]);

  // Save High Score & Coins Changes
  useEffect(() => {
    localStorage.setItem('flappy_high_score', highScore.toString());
  }, [highScore]);

  useEffect(() => {
    localStorage.setItem('flappy_coins', coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem('flappy_unlocked_skins', JSON.stringify(unlockedSkinIds));
  }, [unlockedSkinIds]);

  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleStartGame = () => {
    setScore(0);
    setSessionCoins(0);
    setGameState('PLAYING');
  };

  const handleGameOver = (finalScore: number, coinsEarned: number) => {
    setScore(finalScore);
    setSessionCoins(coinsEarned);

    if (finalScore > highScore) {
      setHighScore(finalScore);
    }

    if (coinsEarned > 0) {
      setCoins((prev) => prev + coinsEarned);
    }

    setGameState('GAMEOVER');

    // Trigger AdMob Interstitial Ad on Game Over
    showInterstitialAd();
  };

  const handleUnlockSkin = (skinId: string, cost: number): boolean => {
    if (coins >= cost && !unlockedSkinIds.includes(skinId)) {
      setCoins((prev) => prev - cost);
      setUnlockedSkinIds((prev) => [...prev, skinId]);
      return true;
    }
    return false;
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-sky-500 via-sky-300 to-sky-100 font-sans text-sky-950 flex flex-col justify-between overflow-x-hidden selection:bg-yellow-400 selection:text-slate-950">
      {/* Dynamic Header Badge for Current Mode */}
      <header className="relative z-20 w-full px-6 py-3 border-b border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-500 animate-pulse" />
          <span className="text-xs font-black uppercase font-mono tracking-widest text-white drop-shadow-sm">
            FLAPPY BIRD ARCADE
          </span>
        </div>

        {gameState === 'PLAYING' && (
          <div className="flex items-center gap-3 bg-white/30 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/40 shadow-sm">
            <span className="text-xs text-sky-900/80 uppercase font-extrabold">SCORE</span>
            <span className="text-xl font-black font-mono text-sky-950">{score}</span>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 w-full flex items-center justify-center p-3 md:p-6">
        {gameState === 'START' && (
          <StartScreen
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onStartGame={handleStartGame}
            highScore={highScore}
            coins={coins}
            unlockedSkinIds={unlockedSkinIds}
            onUnlockSkin={handleUnlockSkin}
          />
        )}

        {(gameState === 'PLAYING' || gameState === 'GAMEOVER') && (
          <GameCanvas
            gameState={gameState}
            settings={settings}
            onGameOver={handleGameOver}
            onUpdateScore={setScore}
            onHomeClick={() => setGameState('START')}
          />
        )}

        {gameState === 'GAMEOVER' && (
          <GameOverModal
            score={score}
            highScore={highScore}
            sessionCoins={sessionCoins}
            totalCoins={coins}
            onRestart={handleStartGame}
            onHome={() => setGameState('START')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-20 w-full bg-[#73BF2E] border-t-8 border-[#548021] py-3 px-4 text-center text-xs font-black italic uppercase tracking-wider text-green-950/80 shadow-lg">
        Tap, click or press <kbd className="bg-yellow-400 text-slate-900 px-2 py-0.5 rounded-lg border-b-2 border-yellow-600 not-italic font-mono">SPACE</kbd> to flap! High scores saved automatically.
      </footer>
    </div>
  );
}
