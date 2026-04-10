import { create } from 'zustand';
import { STATUS_PRIORITY } from '../types/session.js';

const useSessionStore = create((set, get) => ({
  sessions: {},
  selectedSessionId: null,

  addSession: (session) =>
    set((state) => ({
      sessions: { ...state.sessions, [session.info.sessionId]: session },
    })),

  removeSession: (sessionId) =>
    set((state) => {
      const next = { ...state.sessions };
      delete next[sessionId];
      return { sessions: next };
    }),

  updateSession: (session) =>
    set((state) => ({
      sessions: { ...state.sessions, [session.info.sessionId]: session },
    })),

  setSessionCompleted: (session) =>
    set((state) => ({
      sessions: {
        ...state.sessions,
        [session.info.sessionId]: { ...session, status: 'completed' },
      },
    })),

  selectSession: (sessionId) =>
    set({ selectedSessionId: sessionId }),

  hydrate: (sessions) => {
    const map = {};
    for (const s of sessions) {
      map[s.info.sessionId] = s;
    }
    set({ sessions: map });
  },

  getSortedSessions: () => {
    const { sessions } = get();
    return Object.values(sessions).sort((a, b) => {
      const pa = STATUS_PRIORITY[a.status] ?? 4;
      const pb = STATUS_PRIORITY[b.status] ?? 4;
      if (pa !== pb) return pa - pb;
      return b.lastActivity - a.lastActivity;
    });
  },
}));

export default useSessionStore;
