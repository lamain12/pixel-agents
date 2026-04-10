import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSettingsStore = create(
  persist(
    (set) => ({
      notificationsEnabled: true,
      soundEnabled: true,
      webhookEnabled: false,
      webhookUrl: '',

      // Which status transitions trigger notifications
      notifyOnCompleted: true,
      notifyOnErrored: true,
      notifyOnWaiting: true,

      setNotificationsEnabled: (val) => set({ notificationsEnabled: val }),
      setSoundEnabled: (val) => set({ soundEnabled: val }),
      setWebhookEnabled: (val) => set({ webhookEnabled: val }),
      setWebhookUrl: (val) => set({ webhookUrl: val }),
      setNotifyOnCompleted: (val) => set({ notifyOnCompleted: val }),
      setNotifyOnErrored: (val) => set({ notifyOnErrored: val }),
      setNotifyOnWaiting: (val) => set({ notifyOnWaiting: val }),
    }),
    {
      name: 'pixelops-settings',
    }
  )
);

export default useSettingsStore;
