import { useEffect, useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { WORLD_DEPTH, WORLD_WIDTH } from '../config/constants';

export default function Ground() {
  const groundTexture = useTexture('/textures/ground.jpg');
  const groundTileWidth = 12;
  const balancedGroundTexture = useMemo(() => {
    const source = groundTexture.image;
    const width = source.width;
    const height = source.height;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(source, 0, 0);

    const image = context.getImageData(0, 0, width, height);
    const coarseCanvas = document.createElement('canvas');
    coarseCanvas.width = 32;
    coarseCanvas.height = 20;
    const coarseContext = coarseCanvas.getContext('2d', { willReadFrequently: true });
    coarseContext.drawImage(source, 0, 0, coarseCanvas.width, coarseCanvas.height);
    const coarse = coarseContext.getImageData(0, 0, coarseCanvas.width, coarseCanvas.height);
    const luminanceAt = (x, y) => {
      const offset = (y * coarseCanvas.width + x) * 4;
      return coarse.data[offset] * 0.2126 + coarse.data[offset + 1] * 0.7152 + coarse.data[offset + 2] * 0.0722;
    };

    let averageLuminance = 0;
    for (let y = 0; y < coarseCanvas.height; y += 1) {
      for (let x = 0; x < coarseCanvas.width; x += 1) averageLuminance += luminanceAt(x, y);
    }
    averageLuminance /= coarseCanvas.width * coarseCanvas.height;

    const sampleCoarseLuminance = (x, y) => {
      const gx = (x / (width - 1)) * (coarseCanvas.width - 1);
      const gy = (y / (height - 1)) * (coarseCanvas.height - 1);
      const x0 = Math.floor(gx);
      const y0 = Math.floor(gy);
      const x1 = Math.min(x0 + 1, coarseCanvas.width - 1);
      const y1 = Math.min(y0 + 1, coarseCanvas.height - 1);
      const tx = gx - x0;
      const ty = gy - y0;
      const top = luminanceAt(x0, y0) * (1 - tx) + luminanceAt(x1, y0) * tx;
      const bottom = luminanceAt(x0, y1) * (1 - tx) + luminanceAt(x1, y1) * tx;
      return top * (1 - ty) + bottom * ty;
    };

    // Correct only broad lighting variation; the fine grass blades stay untouched.
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const offset = (y * width + x) * 4;
        const localLuminance = Math.max(sampleCoarseLuminance(x, y), 1);
        const correction = Math.max(0.78, Math.min(1.3, Math.pow(averageLuminance / localLuminance, 0.55)));
        image.data[offset] = Math.min(255, image.data[offset] * correction);
        image.data[offset + 1] = Math.min(255, image.data[offset + 1] * correction);
        image.data[offset + 2] = Math.min(255, image.data[offset + 2] * correction);
      }
    }
    context.putImageData(image, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = groundTexture.colorSpace;
    texture.needsUpdate = true;
    return texture;
  }, [groundTexture]);

  useEffect(() => {
    if (balancedGroundTexture) {
      // Mirrored repeats keep the grain scale while avoiding hard seams between tiles.
      balancedGroundTexture.wrapS = balancedGroundTexture.wrapT = THREE.MirroredRepeatWrapping;
      const textureAspect = balancedGroundTexture.image.width / balancedGroundTexture.image.height;
      balancedGroundTexture.repeat.set(
        WORLD_WIDTH / groundTileWidth,
        WORLD_DEPTH / (groundTileWidth / textureAspect),
      );
      balancedGroundTexture.anisotropy = Math.min(8, groundTexture.anisotropy || 1);
      balancedGroundTexture.needsUpdate = true;
    }
  }, [balancedGroundTexture, groundTexture, groundTileWidth]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      {/* Extend beneath the wall bases so their rounded lower edges cannot expose the sky. */}
      <planeGeometry args={[WORLD_WIDTH + 2, WORLD_DEPTH + 2]} />
      <meshStandardMaterial map={balancedGroundTexture} color="#E5EEF3" roughness={0.95} />
    </mesh>
  );
}
