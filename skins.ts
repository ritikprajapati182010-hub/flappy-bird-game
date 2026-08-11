import { BirdSkin } from '../types';

export const SKINS: BirdSkin[] = [
  {
    id: 'classic',
    name: 'Classic Yellow',
    color: '#facc15', // yellow-400
    wingColor: '#fb923c', // orange-400
    beakColor: '#ea580c', // orange-600
    eyeColor: '#ffffff',
    price: 0,
    unlocked: true,
    trailColor: 'rgba(250, 204, 21, 0.4)',
  },
  {
    id: 'cyber',
    name: 'Cyber Neon',
    color: '#06b6d4', // cyan-500
    wingColor: '#a855f7', // purple-500
    beakColor: '#ec4899', // pink-500
    eyeColor: '#ffffff',
    price: 15,
    unlocked: false,
    trailColor: 'rgba(6, 182, 212, 0.4)',
  },
  {
    id: 'phoenix',
    name: 'Fire Phoenix',
    color: '#ef4444', // red-500
    wingColor: '#f59e0b', // amber-500
    beakColor: '#facc15', // yellow-400
    eyeColor: '#ffffff',
    price: 30,
    unlocked: false,
    trailColor: 'rgba(239, 68, 68, 0.4)',
  },
  {
    id: 'golden',
    name: 'Golden Legend',
    color: '#fbbf24', // amber-400
    wingColor: '#fef08a', // yellow-200
    beakColor: '#d97706', // amber-600
    eyeColor: '#ffffff',
    price: 50,
    unlocked: false,
    trailColor: 'rgba(251, 191, 36, 0.5)',
  },
  {
    id: 'sakura',
    name: 'Sakura Pink',
    color: '#f472b6', // pink-400
    wingColor: '#fbcfe8', // pink-200
    beakColor: '#fb923c', // orange-400
    eyeColor: '#ffffff',
    price: 20,
    unlocked: false,
    trailColor: 'rgba(244, 114, 182, 0.4)',
  },
  {
    id: 'midnight',
    name: 'Shadow Ninja',
    color: '#334155', // slate-700
    wingColor: '#0f172a', // slate-900
    beakColor: '#dc2626', // red-600
    eyeColor: '#f87171', // red-400
    price: 40,
    unlocked: false,
    trailColor: 'rgba(51, 65, 85, 0.4)',
  },
];
