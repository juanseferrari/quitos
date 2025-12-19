import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.reydeltruco.app',
  appName: 'Rey del Truco',
  webDir: 'build',
  ios: {
    contentInset: 'never', // Prevent automatic padding that causes layout issues
    scrollEnabled: false, // Disable scrolling to prevent viewport issues
    backgroundColor: '#1a1a1a',
    allowsLinkPreview: false,
    presentationStyle: 'fullscreen',
    webViewConfiguration: {
      allowsInlineMediaPlayback: true,
      allowsAirPlayForMediaPlayback: false
    },
    scheme: 'reydeltruco' // Custom URL scheme for OAuth
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      backgroundColor: '#1a1a1a',
      showSpinner: false
    },
    StatusBar: {
      style: 'light'
    },
    Browser: {
      presentationStyle: 'fullscreen', // ✅ CRÍTICO: fullscreen para OAuth
      windowName: '_blank',
      url: 'about:blank',
      toolbarColor: '#1a1a1a'
    },
    App: {
      urlOpen: {
        iosCustomScheme: 'reydeltruco'
      }
    }
  }
};

export default config;
