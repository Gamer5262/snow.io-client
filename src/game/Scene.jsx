// src/scene/Scene.jsx
import Snowman from '../entities/Snowman';
import FPSCamera from '../camera/FPSCamera';
import Walls from '../world/Walls';
import { useNetwork } from '../net/useNetwork';
import Ground from '../world/Ground';
import ShootController from '../input/ShootController';
import Projectile from '../entities/Projectile';
import SnowballDecal from '../entities/SnowballDecal';
import Sky from '../world/Sky';
import { useGame } from './GameContext';
import { SNOWMAN_BASE_Y } from '../config/constants';

const PLAYER_COLORS = ['#54c7ec', '#ff9f43', '#a66cff', '#ff6384', '#6bd18b'];

function colorForPlayer(sessionId) {
  let hash = 0;
  for (let i = 0; i < sessionId.length; i += 1) {
    hash = (hash * 31 + sessionId.charCodeAt(i)) | 0;
  }
  return PLAYER_COLORS[(hash >>> 0) % PLAYER_COLORS.length];
}

export default function Scene() {
  const { players, projectiles, decals } = useNetwork();
  const { sessionId } = useGame();

  // 1. REMOVED: cameraContextValue = useRef({ camera: null });
  // 2. REMOVED: <CameraContext.Provider> wrapper.
  // Both have been lifted up to Game.jsx so the Canvas and the MovementController can share it.

  // Get player's snowman position for camera following
  const playerData = players[sessionId];
  const playerPos = playerData ? [playerData.x, playerData.y ?? SNOWMAN_BASE_Y, playerData.z] : [0, 0, 0];

  return (
    <>
      {/* FPS Camera - follows player's position and automatically updates the shared context */}
      <FPSCamera playerPosition={playerPos} />
      <Sky />

      {/* Shooting controller */}
      <ShootController />

      {/* Lights - increased intensity */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} />

      <Walls />
      <Ground />

      {/* Players - exclude current player's snowman from render */}
      {Object.entries(players).map(([id, player]) => {
        if (id === sessionId) return null; // Don't render own snowman
        return (
          <Snowman
            key={id}
            position={[player.x, player.y ?? SNOWMAN_BASE_Y, player.z]}
            rotationY={player.rotationY}
            accentColor={colorForPlayer(id)}
          />
        );
      })}

      {/* Projectiles */}
      {Object.entries(projectiles).filter(([, projectile]) => projectile.playerId !== sessionId).map(([id, projectile]) => (
        <Projectile
          key={id}
          id={id}
          position={[projectile.x, projectile.y, projectile.z]}
          velocity={[projectile.vx, projectile.vy, projectile.vz]}
        />
      ))}

      {/* Snow marks left where snowballs hit */}
      {Object.entries(decals).map(([id, decal]) => (
        <SnowballDecal key={id} decal={decal} />
      ))}
    </>
  );
}
