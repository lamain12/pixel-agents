import { useMemo } from 'react';

// Predefined desk positions in the command center
// These correspond to desk locations in the background sprite
const DESK_SLOTS = [
  { x: 80, y: 200 },
  { x: 200, y: 200 },
  { x: 360, y: 200 },
  { x: 480, y: 200 },
  { x: 80, y: 290 },
  { x: 200, y: 290 },
  { x: 360, y: 290 },
  { x: 480, y: 290 },
];

export default function useCharacterPositions(sessions) {
  return useMemo(() => {
    const positions = {};
    sessions.forEach((session, index) => {
      const slot = DESK_SLOTS[index % DESK_SLOTS.length];
      positions[session.info.sessionId] = {
        x: slot.x,
        y: slot.y,
      };
    });
    return positions;
  }, [sessions]);
}
