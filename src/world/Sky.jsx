import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Sky as ThreeSky } from 'three/addons/objects/Sky.js';

const SKY_RADIUS = 900;
const CLOUD_RADIUS = 850;
const SUN_DRIFT = 0.008;

const cloudVertexShader = `
  varying vec3 vDirection;
  void main() {
    vDirection = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const cloudFragmentShader = `
  uniform float uTime;
  varying vec3 vDirection;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.1));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1.0, 0.0, 0.0)), f.x),
          mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
      mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x),
          mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
  }

  void main() {
    vec3 p = normalize(vDirection);
    p *= 3.6;
    p += vec3(uTime * 0.018, uTime * 0.004, uTime * 0.012);

    float clouds = noise(p) * 0.62
      + noise(p * 2.0 + 4.7) * 0.27
      + noise(p * 4.0 + 9.1) * 0.11;
    float coverage = smoothstep(0.39, 0.61, clouds);
    // Keep a dense base layer so the bright atmospheric sky never reads as
    // sunny, while the noise adds softer, drifting overcast cloud structure.
    float alpha = 0.94 + coverage * 0.06;

    vec3 cloudColor = mix(vec3(0.62, 0.70, 0.79), vec3(0.84, 0.89, 0.95), coverage);
    gl_FragColor = vec4(cloudColor, alpha);
  }
`;

export default function Sky() {
  const skyRef = useRef();
  const cloudsRef = useRef();
  const sky = useMemo(() => {
    const dome = new ThreeSky();
    dome.material.depthTest = false;
    dome.material.depthWrite = false;
    dome.material.toneMapped = false;
    dome.material.uniforms.turbidity.value = 10;
    dome.material.uniforms.rayleigh.value = 1.3;
    return dome;
  }, []);
  const sunDirection = useRef(new THREE.Vector3());

  useFrame(({ camera, clock }) => {
    const sky = skyRef.current;
    if (!sky) return;

    // Keep the atmospheric dome centered on the viewer and move the sun slowly
    // around the horizon for gentle, continuous sky movement.
    sky.position.copy(camera.position);
    const angle = clock.elapsedTime * SUN_DRIFT;
    sunDirection.current.set(Math.sin(angle) * 0.7, 0.18, Math.cos(angle)).normalize();
    sky.material.uniforms.sunPosition.value.copy(sunDirection.current);

    const clouds = cloudsRef.current;
    if (clouds) {
      clouds.position.copy(camera.position);
      clouds.material.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return (
    <>
      <primitive
        ref={skyRef}
        object={sky}
        scale={SKY_RADIUS}
        renderOrder={-1000}
        frustumCulled={false}
      />
      <mesh ref={cloudsRef} scale={CLOUD_RADIUS} renderOrder={-999} frustumCulled={false}>
        <sphereGeometry args={[1, 64, 48]} />
        <shaderMaterial
          vertexShader={cloudVertexShader}
          fragmentShader={cloudFragmentShader}
          uniforms={{ uTime: { value: 0 } }}
          side={THREE.BackSide}
          transparent
          // Let walls and ground occlude this distant layer; clouds should only
          // be visible in pixels where the sky itself is visible.
          depthTest
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}
