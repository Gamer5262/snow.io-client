import { useMemo } from 'react';
import { Quaternion, Vector3 } from 'three';

const DECAL_OFFSET = 0.015;

export default function SnowballDecal({ decal }) {
  const normal = useMemo(
    () => new Vector3(decal.nx, decal.ny, decal.nz).normalize(),
    [decal.nx, decal.ny, decal.nz],
  );
  const rotation = useMemo(
    () => new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), normal),
    [normal],
  );
  const position = [
    decal.x + normal.x * DECAL_OFFSET,
    decal.y + normal.y * DECAL_OFFSET,
    decal.z + normal.z * DECAL_OFFSET,
  ];

  return (
    <mesh position={position} quaternion={rotation} renderOrder={2}>
      <circleGeometry args={[0.38, 24]} />
      <meshStandardMaterial color="#f4fbff" roughness={1} depthWrite={false} />
    </mesh>
  );
}
