import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  AdOptions,
} from '@capacitor-community/admob';

// Google AdMob Interstitial Unit ID
export const ADMOB_CONFIG = {
  interstitialAdId: 'ca-app-pub-6591596591691944/8283681634',
  isTesting: false,
};

let isAdMobInitialized = false;
let isInterstitialPrepared = false;

/**
 * Initializes Google Mobile Ads (AdMob) on native platform (Android)
 */
export async function initializeAdMob() {
  if (!Capacitor.isNativePlatform()) {
    console.log('[AdMob] Running on Web - AdMob simulation active');
    return;
  }

  try {
    await AdMob.initialize({
      initializeForTesting: ADMOB_CONFIG.isTesting,
    });
    isAdMobInitialized = true;
    console.log('[AdMob] Successfully initialized AdMob SDK');

    // Preload interstitial ad for Game Over screen
    await preloadInterstitialAd();
  } catch (error) {
    console.warn('[AdMob] Initialization failed:', error);
  }
}

/**
 * Preloads an Interstitial Ad in advance so it displays instantly when called
 */
export async function preloadInterstitialAd() {
  if (!Capacitor.isNativePlatform() || !isAdMobInitialized) return;

  try {
    const options: AdOptions = {
      adId: ADMOB_CONFIG.interstitialAdId,
      isTesting: ADMOB_CONFIG.isTesting,
    };

    await AdMob.prepareInterstitial(options);
    isInterstitialPrepared = true;
    console.log('[AdMob] Interstitial ad prepared successfully');
  } catch (error) {
    console.warn('[AdMob] Failed to prepare interstitial ad:', error);
    isInterstitialPrepared = false;
  }
}

/**
 * Triggers the Interstitial Ad on Game Over
 */
export async function showInterstitialAd() {
  if (!Capacitor.isNativePlatform() || !isAdMobInitialized) {
    console.log('[AdMob] Simulation: Interstitial ad triggered on Game Over');
    return;
  }

  try {
    if (!isInterstitialPrepared) {
      await preloadInterstitialAd();
    }

    if (isInterstitialPrepared) {
      await AdMob.showInterstitial();
      isInterstitialPrepared = false;
      console.log('[AdMob] Interstitial ad shown to user');
      // Preload next interstitial ad for future game over
      preloadInterstitialAd();
    }
  } catch (error) {
    console.warn('[AdMob] Failed to show interstitial ad:', error);
    preloadInterstitialAd();
  }
}
