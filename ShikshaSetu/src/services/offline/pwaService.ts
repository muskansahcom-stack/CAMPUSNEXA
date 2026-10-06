type PwaInstallListener = (canInstall: boolean) => void;

class PwaService {
  private deferredPrompt: any = null;
  private listeners: Set<PwaInstallListener> = new Set();
  private isInstalled = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent default mini-infobar and save prompt
        e.preventDefault();
        this.deferredPrompt = e;
        this.notifyListeners(true);
      });

      window.addEventListener('appinstalled', () => {
        this.deferredPrompt = null;
        this.isInstalled = true;
        this.notifyListeners(false);
      });

      // Check if running in standalone display mode
      if (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      ) {
        this.isInstalled = true;
      }
    }
  }

  public subscribeInstallable(listener: PwaInstallListener): () => void {
    this.listeners.add(listener);
    listener(Boolean(this.deferredPrompt));
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(canInstall: boolean): void {
    this.listeners.forEach((l) => l(canInstall));
  }

  public getCanInstall(): boolean {
    return Boolean(this.deferredPrompt);
  }

  public getIsInstalled(): boolean {
    return this.isInstalled;
  }

  public async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    this.notifyListeners(false);
    return outcome === 'accepted';
  }

  public async promptPWAInstall(): Promise<boolean> {
    return this.promptInstall();
  }

  public registerServiceWorker(): void {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('ShikshaSetu PWA Service Worker active:', registration.scope);
          })
          .catch((err) => {
            console.warn('PWA Service Worker registration skipped:', err);
          });
      });
    }
  }
}

export const pwaService = new PwaService();
