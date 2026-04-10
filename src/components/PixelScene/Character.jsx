import React, { useRef, useCallback } from 'react';
import { Sprite, Texture, Rectangle } from 'pixi.js';

import workingUrl from '../../assets/sprites/agent-working.png';
import doneUrl from '../../assets/sprites/agent-done.png';
import erroredUrl from '../../assets/sprites/agent-errored.png';

const SPRITE_MAP = {
  active: workingUrl,
  completed: doneUrl,
  errored: erroredUrl,
  waiting: erroredUrl,
  unknown: workingUrl,
};

const FRAME_SIZE = 32;
const SCALE = 2;

export default function Character({ session, position, onHover, onClick }) {
  const spriteRef = useRef(null);
  const frameRef = useRef(0);
  const timerRef = useRef(null);

  const spriteUrl = SPRITE_MAP[session.status] || SPRITE_MAP.unknown;

  const handleMount = useCallback((sprite) => {
    if (!sprite) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    spriteRef.current = sprite;

    sprite.eventMode = 'static';
    sprite.cursor = 'pointer';
    sprite.scale.set(SCALE);

    // Set up frame animation by changing texture region
    const baseTexture = sprite.texture.source;

    function setFrame(frame) {
      const x = frame * FRAME_SIZE;
      sprite.texture = new Texture({
        source: baseTexture,
        frame: new Rectangle(x, 0, FRAME_SIZE, FRAME_SIZE),
      });
    }

    // Wait for texture to load before starting animation
    if (baseTexture.loaded) {
      setFrame(0);
      timerRef.current = setInterval(() => {
        frameRef.current = (frameRef.current + 1) % 4;
        setFrame(frameRef.current);
      }, 300);
    } else {
      baseTexture.once('loaded', () => {
        setFrame(0);
        timerRef.current = setInterval(() => {
          frameRef.current = (frameRef.current + 1) % 4;
          setFrame(frameRef.current);
        }, 300);
      });
    }

    sprite.on('pointerover', () => {
      if (onHover) onHover(session, position);
    });
    sprite.on('pointerout', () => {
      if (onHover) onHover(null, null);
    });
    sprite.on('pointertap', () => {
      if (onClick) onClick(session);
    });
  }, [session.status, session.info.sessionId]);

  return (
    <pixiSprite
      ref={handleMount}
      image={spriteUrl}
      x={position.x}
      y={position.y}
      anchor={0.5}
    />
  );
}
