import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { GRAVITY, WALL_HEIGHT } from '../config/constants';
import { PROJECTILE_RADIUS } from './Projectile';

const IMPACT_HOLD_SECONDS = 0.3;
const COLLISION_RADIUS = 1.5;

export default function LocalProjectile({ shot, players, sessionId, onFinished }) {
  const meshRef = useRef();
  const position = useRef(new Vector3(...shot.position));
  const velocity = useRef(new Vector3(...shot.velocity));
  const age = useRef(0);
  const impactAge = useRef(null);
  const finished = useRef(false);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh || finished.current) return;

    age.current += delta;

    if (impactAge.current === null) {
      velocity.current.y -= GRAVITY * delta;
      position.current.addScaledVector(velocity.current, delta);

      let hit = position.current.y <= 0
        || (position.current.y <= WALL_HEIGHT && (Math.abs(position.current.x) >= 50 || Math.abs(position.current.z) >= 50));

      if (!hit) {
        for (const [playerId, player] of Object.entries(players)) {
          if (playerId === sessionId) continue;
          const distance = Math.hypot(
            position.current.x - player.x,
            position.current.y - player.y,
            position.current.z - player.z,
          );
          if (distance < COLLISION_RADIUS) {
            hit = true;
            break;
          }
        }
      }

      if (hit) impactAge.current = 0;
    } else {
      impactAge.current += delta;
      if (impactAge.current >= IMPACT_HOLD_SECONDS) {
        finished.current = true;
        onFinished(shot.id);
        return;
      }
    }

    mesh.position.copy(position.current);
  });

  return (
    <mesh ref={meshRef} position={shot.position}>
      <sphereGeometry args={[PROJECTILE_RADIUS, 16, 16]} />
      <meshStandardMaterial color="#DCEEFF" emissive="#8EBFE0" emissiveIntensity={0.2} roughness={0.65} />
    </mesh>
  );
}
