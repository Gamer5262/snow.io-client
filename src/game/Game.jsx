// src/components/Game.jsx
import { Canvas } from '@react-three/fiber';
import { useRef } from 'react';
import { GameContext } from './GameContext';
import Scene from './Scene';
import Reticle from '../ui/Reticle';
import FPSCounter from '../ui/FPSCounter';
import MovementController from '../input/MovementController';
import { InputContext } from '../hooks/InputContext';
import { useInputProvider } from '../hooks/useInput';
import { CameraContext } from '../camera/CameraContext';

export default function Game({ room }) {
  const gameDivRef = useRef(null);
  const input = useInputProvider(gameDivRef);
  
  // Lift the shared camera context value up here
  const cameraRef = useRef({ camera: null });

  return (
    <GameContext.Provider value={{ room, sessionId: room?.sessionId }}>
      <InputContext.Provider value={input}>
        <CameraContext.Provider value={cameraRef.current}>
          <div ref={gameDivRef} tabIndex={0} style={{ position: 'relative', width: '100%', height: '100%', outline: 'none' }}>
            <FPSCounter />
            <Reticle />
            <MovementController />
            <Canvas
              camera={{ position: [0, 5, 10], fov: 75 }}
              style={{ width: '100%', height: '100%', display: 'block' }}
            >
              <Scene />
            </Canvas>
          </div>
        </CameraContext.Provider>
      </InputContext.Provider>
    </GameContext.Provider>
  );
}
