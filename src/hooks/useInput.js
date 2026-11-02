// src/hooks/useInput.js
import { useState, useEffect, useContext } from 'react';
import { InputContext } from './InputContext';

export function useInputProvider(ref) {
  const [input, setInput] = useState({ forward: 0, right: 0, mouseClick: false, shootCount: 0 });

  useEffect(() => {
    const target = ref?.current || window;

    const handleKeyDown = (e) => {
      setInput((prev) => {
        const copy = { ...prev };
        if (e.key.toLowerCase() === 'w') copy.forward = 1;
        if (e.key.toLowerCase() === 's') copy.forward = -1;
        if (e.key.toLowerCase() === 'a') copy.right = -1;
        if (e.key.toLowerCase() === 'd') copy.right = 1;
        return copy;
      });
    };

    const handleKeyUp = (e) => {
      setInput((prev) => {
        const copy = { ...prev };
        if (e.key.toLowerCase() === 'w' && copy.forward === 1) copy.forward = 0;
        if (e.key.toLowerCase() === 's' && copy.forward === -1) copy.forward = 0;
        if (e.key.toLowerCase() === 'a' && copy.right === -1) copy.right = 0;
        if (e.key.toLowerCase() === 'd' && copy.right === 1) copy.right = 0;
        return copy;
      });
    };

    const handleMouseDown = (e) => {
      if (e.button === 0) {
        setInput((prev) => ({ ...prev, mouseClick: true, shootCount: prev.shootCount + 1 }));
      }
    };

    const handleMouseUp = (e) => {
      if (e.button === 0) {
        setInput((prev) => ({ ...prev, mouseClick: false }));
      }
    };

    target.addEventListener('mousedown', handleMouseDown);
    target.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown); // Window works best for global movement focus
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      target.removeEventListener('mousedown', handleMouseDown);
      target.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [ref]);

  return input;
}

export function useInput() {
  return useContext(InputContext);
}
