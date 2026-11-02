import { useEffect, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { WORLD_DEPTH, WORLD_WIDTH, WALL_HEIGHT } from "../config/constants";

const WALL_EDGE_RADIUS = 0.24;

function RoundedWall({ position, size, texture }) {
  const geometry = useMemo(
    () => new RoundedBoxGeometry(...size, WALL_EDGE_RADIUS, 4),
    [size],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh position={position} geometry={geometry}>
      <meshStandardMaterial map={texture} roughness={0.9} />
    </mesh>
  );
}

export default function Walls() {
  const wallHeight = WALL_HEIGHT;
  const wallGeometryHeight = wallHeight + WALL_EDGE_RADIUS;
  const wallCenterY = wallHeight / 2 - WALL_EDGE_RADIUS / 2;
  const wallThickness = 1;
  const wallTileWidth = 12;
  const halfWidth = WORLD_WIDTH / 2;
  const halfDepth = WORLD_DEPTH / 2;
  const wallTexture = useTexture("/textures/wall.jpg");

  wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
  const textureAspect = wallTexture.image.width / wallTexture.image.height;
  wallTexture.repeat.set(
    (WORLD_WIDTH + 2 * wallThickness + 2 * WALL_EDGE_RADIUS) / wallTileWidth,
    wallHeight / (wallTileWidth / textureAspect),
  );
  wallTexture.needsUpdate = true;

  const walls = useMemo(() => [
    { key: "front", position: [0, wallCenterY, -halfDepth - wallThickness / 2], size: [WORLD_WIDTH + 2 * wallThickness + 2 * WALL_EDGE_RADIUS, wallGeometryHeight, wallThickness] },
    { key: "back", position: [0, wallCenterY, halfDepth + wallThickness / 2], size: [WORLD_WIDTH + 2 * wallThickness + 2 * WALL_EDGE_RADIUS, wallGeometryHeight, wallThickness] },
    { key: "left", position: [-halfWidth - wallThickness / 2, wallCenterY, 0], size: [wallThickness, wallGeometryHeight, WORLD_DEPTH + 2 * WALL_EDGE_RADIUS] },
    { key: "right", position: [halfWidth + wallThickness / 2, wallCenterY, 0], size: [wallThickness, wallGeometryHeight, WORLD_DEPTH + 2 * WALL_EDGE_RADIUS] },
  ], [wallCenterY, wallGeometryHeight, wallThickness, halfWidth, halfDepth]);

  return (
    <>
      {walls.map((wall) => (
        <RoundedWall key={wall.key} {...wall} texture={wallTexture} />
      ))}
    </>
  );
}
