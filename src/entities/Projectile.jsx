// src/entities/Projectile.jsx
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

export const PROJECTILE_RADIUS = 0.35;

export default function Projectile({
 position = [0, 0, 0],
 initialPosition = position,
 velocity = [0, 0, 0],
 id,
 onOutOfRange = () => {},
}) {
 const meshRef = useRef();
 const currentPosition = position.length === 3 ? position : initialPosition;

 useEffect(() => {
   if (meshRef.current) {
     meshRef.current.position.set(currentPosition[0], currentPosition[1], currentPosition[2]);
   }
 }, [currentPosition, id]);

 useFrame(() => {
   if (!meshRef.current) return;
   meshRef.current.position.set(currentPosition[0], currentPosition[1], currentPosition[2]);
 });

 return (
   <mesh ref={meshRef} position={currentPosition}>
     <sphereGeometry args={[PROJECTILE_RADIUS, 16, 16]} />
     <meshStandardMaterial
       color="#DCEEFF"
       emissive="#8EBFE0"
       emissiveIntensity={0.2}
       roughness={0.65}
     />
   </mesh>
 );
}
