const webApp = window.Telegram?.WebApp || (window as any).Telegram?.WebApp;

export const initTelegramApp = () => {
  if (!webApp) return;
  webApp.ready();
  webApp.expand();
  if (webApp.enableClosingConfirmation) {
    webApp.enableClosingConfirmation();
  }
  if (webApp.setHeaderColor) {
    try {
      webApp.setHeaderColor('#000000');
    } catch(e) {}
  }
};

export const getTelegramUser = () => webApp?.initDataUnsafe?.user;

export const getTelegramUserId = () => {
  const id = webApp?.initDataUnsafe?.user?.id;
  if (!id) {
    throw new Error('Unauthorized: Telegram Identity Missing');
  }
  return id;
};

export const triggerHaptic = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
  if (webApp?.HapticFeedback) {
    webApp.HapticFeedback.impactOccurred(style);
  }
};

export const triggerNotificationFeedback = (type: 'error' | 'success' | 'warning') => {
  if (webApp?.HapticFeedback) {
    webApp.HapticFeedback.notificationOccurred(type);
  }
};
