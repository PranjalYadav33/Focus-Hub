import React, { useEffect, useRef } from 'react';
import { animateIn } from '@/utils/motion';

interface AnimatedContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: keyof JSX.IntrinsicElements;
  variant?: 'fadeUp' | 'fade' | 'scale';
  delay?: number;
}

const AnimatedContainer: React.FC<AnimatedContainerProps> = ({ as: Tag = 'div', children, variant = 'fadeUp', delay = 0, ...props }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const base = variant === 'fade' ? { opacity: [0, 1] } : variant === 'scale' ? { opacity: [0, 1], scale: [0.98, 1] } : { opacity: [0, 1], translateY: [8, 0] };
    animateIn(ref.current, { delay, ...base });
  }, [variant, delay]);

  return (
    <Tag ref={ref as any} {...props}>
      {children}
    </Tag>
  );
};

export default AnimatedContainer;

