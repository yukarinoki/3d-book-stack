import { useEffect, useRef, useState } from 'react';

interface TouchGestureState {
  isPinching: boolean;
  pinchScale: number;
  isRotating: boolean;
  rotation: number;
  isSwiping: boolean;
  swipeDirection: 'left' | 'right' | 'up' | 'down' | null;
  touchCount: number;
}

interface TouchGestureOptions {
  onPinch?: (scale: number) => void;
  onRotate?: (angle: number) => void;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  onDoubleTap?: () => void;
  target?: HTMLElement | null;
}

export const useTouchGestures = ({
  onPinch,
  onRotate,
  onSwipe,
  onDoubleTap,
  target,
}: TouchGestureOptions = {}) => {
  const [gestureState, setGestureState] = useState<TouchGestureState>({
    isPinching: false,
    pinchScale: 1,
    isRotating: false,
    rotation: 0,
    isSwiping: false,
    swipeDirection: null,
    touchCount: 0,
  });

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = useRef<number>(0);
  const initialPinchDistanceRef = useRef<number>(0);
  const initialRotationRef = useRef<number>(0);

  useEffect(() => {
    const element = target || document;

    const getDistance = (touch1: Touch, touch2: Touch) => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const getAngle = (touch1: Touch, touch2: Touch) => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.atan2(dy, dx) * 180 / Math.PI;
    };

    const handleTouchStart = (e: TouchEvent) => {
      const touchCount = e.touches.length;
      setGestureState(prev => ({ ...prev, touchCount }));

      if (touchCount === 1) {
        const touch = e.touches[0];
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now(),
        };

        // ダブルタップ検出
        const currentTime = Date.now();
        if (currentTime - lastTapRef.current < 300 && onDoubleTap) {
          onDoubleTap();
        }
        lastTapRef.current = currentTime;
      } else if (touchCount === 2) {
        // ピンチとローテーションの初期値を設定
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialPinchDistanceRef.current = getDistance(touch1, touch2);
        initialRotationRef.current = getAngle(touch1, touch2);
        
        setGestureState(prev => ({
          ...prev,
          isPinching: true,
          isRotating: true,
        }));
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        // ピンチ処理
        if (initialPinchDistanceRef.current > 0) {
          const currentDistance = getDistance(touch1, touch2);
          const scale = currentDistance / initialPinchDistanceRef.current;
          
          setGestureState(prev => ({ ...prev, pinchScale: scale }));
          if (onPinch) {
            onPinch(scale);
          }
        }

        // ローテーション処理
        if (initialRotationRef.current !== null) {
          const currentAngle = getAngle(touch1, touch2);
          const rotation = currentAngle - initialRotationRef.current;
          
          setGestureState(prev => ({ ...prev, rotation }));
          if (onRotate) {
            onRotate(rotation);
          }
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchCount = e.touches.length;
      setGestureState(prev => ({ ...prev, touchCount }));

      if (touchCount === 0 && touchStartRef.current) {
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartRef.current.x;
        const deltaY = touch.clientY - touchStartRef.current.y;
        const deltaTime = Date.now() - touchStartRef.current.time;

        // スワイプ検出（100px以上の移動かつ500ms以内）
        if (Math.abs(deltaX) > 100 || Math.abs(deltaY) > 100) {
          if (deltaTime < 500) {
            let direction: 'left' | 'right' | 'up' | 'down';
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              direction = deltaX > 0 ? 'right' : 'left';
            } else {
              direction = deltaY > 0 ? 'down' : 'up';
            }

            setGestureState(prev => ({
              ...prev,
              isSwiping: true,
              swipeDirection: direction,
            }));

            if (onSwipe) {
              onSwipe(direction);
            }

            // スワイプ状態をリセット
            setTimeout(() => {
              setGestureState(prev => ({
                ...prev,
                isSwiping: false,
                swipeDirection: null,
              }));
            }, 300);
          }
        }

        touchStartRef.current = null;
      }

      // ピンチとローテーションをリセット
      if (touchCount < 2) {
        setGestureState(prev => ({
          ...prev,
          isPinching: false,
          isRotating: false,
          pinchScale: 1,
          rotation: 0,
        }));
        initialPinchDistanceRef.current = 0;
        initialRotationRef.current = 0;
      }
    };

    element.addEventListener('touchstart', handleTouchStart as EventListener);
    element.addEventListener('touchmove', handleTouchMove as EventListener);
    element.addEventListener('touchend', handleTouchEnd as EventListener);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart as EventListener);
      element.removeEventListener('touchmove', handleTouchMove as EventListener);
      element.removeEventListener('touchend', handleTouchEnd as EventListener);
    };
  }, [target, onPinch, onRotate, onSwipe, onDoubleTap]);

  return gestureState;
};