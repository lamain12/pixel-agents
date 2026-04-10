import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Application, extend } from '@pixi/react';
import { Container, Sprite, Texture, Rectangle } from 'pixi.js';
import useSessionStore from '../../stores/sessionStore.js';
import useCharacterPositions from './useCharacterPositions.js';
import Tooltip from './Tooltip.jsx';
import Character from './Character.jsx';
import './PixelScene.css';

import bgUrl from '../../assets/sprites/command-center-bg.png';

// Register PixiJS components for JSX
extend({ Container, Sprite });

const SCENE_WIDTH = 640;
const SCENE_HEIGHT = 400;

function SceneContent({ sessions, positions, onHover, onClick }) {
  return (
    <pixiContainer>
      <pixiSprite image={bgUrl} x={0} y={0} />
      {sessions.map((session) => {
        const pos = positions[session.info.sessionId];
        if (!pos) return null;
        return (
          <Character
            key={session.info.sessionId}
            session={session}
            position={pos}
            onHover={onHover}
            onClick={onClick}
          />
        );
      })}
    </pixiContainer>
  );
}

export default function PixelScene() {
  const getSortedSessions = useSessionStore((s) => s.getSortedSessions);
  const sessions = getSortedSessions();
  const positions = useCharacterPositions(sessions);
  const [hoveredSession, setHoveredSession] = useState(null);
  const [tooltipPos, setTooltipPos] = useState(null);

  const handleHover = useCallback((session, position) => {
    setHoveredSession(session);
    setTooltipPos(position);
  }, []);

  const handleClick = useCallback((session) => {
    // Future: open detail panel
    console.log('Clicked session:', session.label);
  }, []);

  return (
    <div className="pixel-scene-container">
      <Application
        width={SCENE_WIDTH}
        height={SCENE_HEIGHT}
        background="#1a1a2e"
        antialias={false}
        resolution={1}
      >
        <SceneContent
          sessions={sessions}
          positions={positions}
          onHover={handleHover}
          onClick={handleClick}
        />
      </Application>
      <Tooltip session={hoveredSession} position={tooltipPos} />
      {sessions.length === 0 && (
        <div className="scene-empty">
          <p>No active Claude sessions</p>
          <p>Start a Claude Code session to see agents appear</p>
        </div>
      )}
    </div>
  );
}
