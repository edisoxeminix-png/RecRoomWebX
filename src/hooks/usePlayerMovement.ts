import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

export function usePlayerMovement() {
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const rotationRef = useRef<[number, number, number]>([0, 0, 0]);
  const positionRef = useRef<[number, number, number]>([0, 0, 0]);
  
  const [isSwitchMode, setIsSwitchMode] = useState(false);
  const [plusButtonPressed, setPlusButtonPressed] = useState(false);
  const [gamepadAxes, setGamepadAxes] = useState<[number, number]>([0, 0]);
  
  // Hand States
  const [handLOffset, setHandLOffset] = useState<[number, number, number]>([0, 0, 0]);
  const [handROffset, setHandROffset] = useState<[number, number, number]>([0, 0, 0]);
  const [gripL, setGripL] = useState(0); // 0 to 1
  const [gripR, setGripR] = useState(0);

  const keys = useRef<{ [key: string]: boolean }>({});
  const speed = 0.15;
  const rotationSpeed = 0.05;
  const handMoveSpeed = 0.05;

  // Sync state to refs for use in stable update loop
  useEffect(() => {
    rotationRef.current = rotation;
    positionRef.current = position;
  }, [rotation, position]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => (keys.current[e.code] = true);
    const handleKeyUp = (e: KeyboardEvent) => (keys.current[e.code] = false);

    const handleGamepadConnect = (e: GamepadEvent) => {
      const id = e.gamepad.id.toLowerCase();
      if (id.includes('nintendo') || id.includes('joy-con') || id.includes('switch')) {
        setIsSwitchMode(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('gamepadconnected', handleGamepadConnect);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('gamepadconnected', handleGamepadConnect);
    };
  }, []);

  const [isLHandActive, setIsLHandActive] = useState(false);
  const [isRHandActive, setIsRHandActive] = useState(false);

  const lastPlusPressed = useRef(false);
  const motionIntensity = useRef(0);

  useEffect(() => {
    const handleMotion = (e: DeviceMotionEvent) => {
      if (e.acceleration) {
        const { x, y, z } = e.acceleration;
        const total = Math.sqrt((x||0)**2 + (y||0)**2 + (z||0)**2);
        if (total > 8) { // Shake/Walk threshold
          motionIntensity.current = 1.0;
          setTimeout(() => motionIntensity.current = 0, 500);
        }
      }
    };
    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, []);

  const teleportRequestRef = useRef<[number, number, number] | null>(null);

  const teleport = useCallback((pos: [number, number, number]) => {
    teleportRequestRef.current = pos;
    setPosition(pos);
  }, []);

  const update = useCallback(() => {
    // Gamepad Input
    const gamepads = navigator.getGamepads();
    let gpMoveX = 0;
    let gpMoveY = 0;
    let gpRotate = 0;
    let curAxes: [number, number] = [0, 0];

    let lActive = false;
    let rActive = false;

    for (const gp of gamepads) {
      if (gp) {
        // L/R buttons (Bumpers) enable hand control for their respective stick
        const isLHandMode = gp.buttons[4]?.pressed; // L Bumper
        const isRHandMode = gp.buttons[5]?.pressed; // R Bumper
        if (isLHandMode) lActive = true;
        if (isRHandMode) rActive = true;

        // Grip with Triggers
        const curGripL = gp.buttons[6]?.value ?? (gp.buttons[6]?.pressed ? 1 : 0);
        const curGripR = gp.buttons[7]?.value ?? (gp.buttons[7]?.pressed ? 1 : 0);
        setGripL(curGripL);
        setGripR(curGripR);

        // Body Movement vs Hand Movement
        if (isLHandMode) {
          setHandLOffset(prev => [
            Math.max(-1.5, Math.min(1.5, prev[0] + gp.axes[0] * handMoveSpeed * 1.5)),
            Math.max(-0.5, Math.min(1.5, prev[1] - gp.axes[1] * handMoveSpeed * 1.5)),
            prev[2]
          ]);
        } else {
          if (Math.abs(gp.axes[0]) > 0.1) gpMoveX = gp.axes[0];
          if (Math.abs(gp.axes[1]) > 0.1) gpMoveY = gp.axes[1];
        }
        
        if (isRHandMode) {
          setHandROffset(prev => [
            Math.max(-1.5, Math.min(1.5, prev[0] + gp.axes[2] * handMoveSpeed * 1.5)),
            Math.max(-0.5, Math.min(1.5, prev[1] - gp.axes[3] * handMoveSpeed * 1.5)),
            prev[2]
          ]);
        } else {
          if (gp.axes.length >= 4) {
            if (Math.abs(gp.axes[2]) > 0.1) {
              gpRotate = -gp.axes[2] * rotationSpeed;
              curAxes[0] = gp.axes[2];
            }
            if (Math.abs(gp.axes[3]) > 0.1) {
              curAxes[1] = gp.axes[3];
            }
          }
        }

        const isPlusDown = gp.buttons[9]?.pressed || gp.buttons[8]?.pressed || gp.buttons[16]?.pressed || gp.buttons[17]?.pressed;
        if (isPlusDown && !lastPlusPressed.current) {
          setPlusButtonPressed(true);
          setTimeout(() => setPlusButtonPressed(false), 100);
        }
        lastPlusPressed.current = isPlusDown;

        // Reset hands (Y button or similar)
        if (gp.buttons[3]?.pressed || gp.buttons[2]?.pressed) {
          setHandLOffset([0, 0, 0]);
          setHandROffset([0, 0, 0]);
        }
        
        setGamepadAxes(curAxes);
      }
    }

    // Keyboard Grip
    if (keys.current['KeyF']) setGripL(1);
    else if (!gamepads[0]?.buttons[6]?.pressed) setGripL(0);
    
    if (keys.current['KeyG']) setGripR(1);
    else if (!gamepads[0]?.buttons[7]?.pressed) setGripR(0);

    // Keyboard Hand Activation
    if (keys.current['KeyL']) lActive = true;
    if (keys.current['KeyR']) rActive = true;

    setIsLHandActive(lActive);
    setIsRHandActive(rActive);

    setRotation(prev => {
      const next = [...prev] as [number, number, number];
      if (!lActive && !rActive) {
        if (keys.current['KeyQ']) next[1] += rotationSpeed;
        if (keys.current['KeyE']) next[1] -= rotationSpeed;
      }
      next[1] += gpRotate;
      return next;
    });

    setPosition(prev => {
      // If a teleport was requested, start from there
      let current = [...prev] as [number, number, number];
      if (teleportRequestRef.current) {
        current = teleportRequestRef.current;
        teleportRequestRef.current = null;
        return current; // Don't apply movement on the teleport frame
      }

      const next = current;
      const curRot = rotationRef.current[1];
      
      const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), curRot);
      const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), curRot);

      if (lActive) {
        setHandLOffset(prev => [
          Math.max(-1.5, Math.min(1.5, prev[0] + (keys.current['ArrowRight'] ? 1 : keys.current['ArrowLeft'] ? -1 : 0) * handMoveSpeed)),
          Math.max(-0.5, Math.min(1.5, prev[1] + (keys.current['ArrowUp'] ? 1 : keys.current['ArrowDown'] ? -1 : 0) * handMoveSpeed)),
          prev[2]
        ]);
      } else if (rActive) {
        setHandROffset(prev => [
          Math.max(-1.5, Math.min(1.5, prev[0] + (keys.current['ArrowRight'] ? 1 : keys.current['ArrowLeft'] ? -1 : 0) * handMoveSpeed)),
          Math.max(-0.5, Math.min(1.5, prev[1] + (keys.current['ArrowUp'] ? 1 : keys.current['ArrowDown'] ? -1 : 0) * handMoveSpeed)),
          prev[2]
        ]);
      } else {
        if (keys.current['KeyW']) {
          next[0] += forward.x * speed;
          next[2] += forward.z * speed;
        }
        if (keys.current['KeyS']) {
          next[0] -= forward.x * speed;
          next[2] -= forward.z * speed;
        }
        if (keys.current['KeyA']) {
          next[0] -= right.x * speed;
          next[2] -= right.z * speed;
        }
        if (keys.current['KeyD']) {
          next[0] += right.x * speed;
          next[2] += right.z * speed;
        }
      }

      // Gamepad
      next[0] += (forward.x * -gpMoveY + right.x * gpMoveX) * speed;
      next[2] += (forward.z * -gpMoveY + right.z * gpMoveX) * speed;

      // Real-life Walking (Motion Intensity)
      if (motionIntensity.current > 0.1) {
        next[0] += forward.x * speed * 0.8;
        next[2] += forward.z * speed * 0.8;
      }

      // Boundary
      next[0] = Math.max(-9.5, Math.min(9.5, next[0]));
      next[2] = Math.max(-9.5, Math.min(9.5, next[2]));

      return next;
    });
  }, []);

  return { 
    position, 
    setPosition,
    teleport,
    rotation, 
    setRotation,
    update, 
    isSwitchMode, 
    plusButtonPressed, 
    gamepadAxes,
    handLOffset,
    handROffset,
    gripL,
    gripR,
    isLHandActive,
    isRHandActive
  };
}
