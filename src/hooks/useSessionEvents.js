import { useEffect } from 'react';
import useSessionStore from '../stores/sessionStore.js';

export default function useSessionEvents() {
  const hydrate = useSessionStore((s) => s.hydrate);
  const addSession = useSessionStore((s) => s.addSession);
  const updateSession = useSessionStore((s) => s.updateSession);
  const setSessionCompleted = useSessionStore((s) => s.setSessionCompleted);

  useEffect(() => {
    if (!window.electronAPI) return;

    // Initial hydration
    window.electronAPI.getSessions().then((sessions) => {
      hydrate(sessions);
    });

    // Live event listeners
    window.electronAPI.onSessionStarted((session) => {
      addSession(session);
    });

    window.electronAPI.onSessionUpdated(({ session }) => {
      updateSession(session);
    });

    window.electronAPI.onSessionEnded((session) => {
      setSessionCompleted(session);
    });

    return () => {
      if (window.electronAPI.removeAllListeners) {
        window.electronAPI.removeAllListeners('session-started');
        window.electronAPI.removeAllListeners('session-updated');
        window.electronAPI.removeAllListeners('session-ended');
      }
    };
  }, [hydrate, addSession, updateSession, setSessionCompleted]);
}
