'use client';

import { useEffect, useState, useRef } from 'react';

const AnimatedCounter = ({ value, className }: { value: number; className?: string }) => {
  const [count, setCount] = useState(0);
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        setCount(prevCount => {
          // Ensure we don't overshoot the target
          if (prevCount >= value) {
            cancelAnimationFrame(requestRef.current!);
            return value;
          }
          // Adjust the step based on how close we are to the target
          const remaining = value - prevCount;
          const step = Math.max(1, Math.ceil(remaining / 20));
          return prevCount + step;
        });
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };
    
    // Reset and start animation
    previousTimeRef.current = undefined;
    setCount(0);
    requestRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(requestRef.current!);
  }, [value]);

  return <span className={className}>{Math.round(count)}</span>;
};

export default AnimatedCounter;
