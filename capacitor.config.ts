import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.flappybird.arcade',
  appName: 'Flappy Bird Arcade',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    AdMob: {
      // Production AdMob App ID
      appId: 'ca-app-pub-6591596591691944~7545580963'
    }
  }
};

export default config;
