declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        expand: () => void;
        isVersionAtLeast: (version: string) => boolean;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        setBottomBarColor: (color: string) => void;
        initDataUnsafe?: {
          user?: {
            id: number;
            [key: string]: any;
          };
        };
      };
    };
  }
}

export const initTelegramApp = () => {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
    return;
  }
  
  const tg = window.Telegram.WebApp;
  tg.expand();
  
  if (tg.isVersionAtLeast && tg.isVersionAtLeast('6.1')) {
    tg.setHeaderColor('#050505');
    tg.setBackgroundColor('#050505');
  }
  
  if (tg.isVersionAtLeast && tg.isVersionAtLeast('7.10')) {
    tg.setBottomBarColor('#050505');
  }
};

export const getTelegramUserId = () => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
    return window.Telegram.WebApp.initDataUnsafe.user.id;
  }
  return null;
};