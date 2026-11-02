// src/input/ShootController.jsx
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useInput } from '../hooks/useInput';
import { GameContext } from '../game/GameContext';
import { useCameraRef } from '../camera/CameraContext';
import { useNetwork } from '../net/useNetwork';
import LocalProjectile from '../entities/LocalProjectile';
import { Vector2, Raycaster, Vector3 } from 'three';

const SNOWBALL_SPEED = 50;
// Keep the camera outside the snowball so its near surface doesn't fill the view.
const SNOWBALL_SPAWN_OFFSET = 1.3;
const SHOT_COOLDOWN_MS = 250;

export default function ShootController() {
  const { shootCount } = useInput();
  const { room, sessionId } = useContext(GameContext);
  const { players } = useNetwork();
  const [localShots, setLocalShots] = useState([]);
  const cameraContext = useCameraRef();
  const lastShotTimeRef = useRef(0);
  const handledShotCount = useRef(0);

  useEffect(() => {
    if (!shootCount || shootCount === handledShotCount.current) return;
    handledShotCount.current = shootCount;
    if (!room || !cameraContext?.camera) return;

    const now = Date.now();
    if (now - lastShotTimeRef.current < SHOT_COOLDOWN_MS) return;

    const camera = cameraContext.camera;
    const raycaster = new Raycaster();
    raycaster.setFromCamera(new Vector2(0, 0), camera);
    const direction = raycaster.ray.direction.clone();
    const spawnPosition = camera.position.clone().addScaledVector(direction, SNOWBALL_SPAWN_OFFSET);
    const velocity = direction.multiplyScalar(SNOWBALL_SPEED);
    const shot = {
      id: `${now}-${Math.random()}`,
      position: [spawnPosition.x, spawnPosition.y, spawnPosition.z],
      velocity: [velocity.x, velocity.y, velocity.z],
    };

    setLocalShots((shots) => [...shots, shot]);
    room.send('shoot', { ...shot, timestamp: now });
    lastShotTimeRef.current = now;
  }, [shootCount, room, cameraContext]);

  const removeShot = useCallback((shotId) => {
    setLocalShots((shots) => shots.filter((shot) => shot.id !== shotId));
  }, []);

  return localShots.map((shot) => (
    <LocalProjectile
      key={shot.id}
      shot={shot}
      players={players}
      sessionId={sessionId}
      onFinished={removeShot}
    />
  ));
}
