import React from 'react';
import { IconProps } from '../types/types';

const Icon: React.FC<IconProps> = ({ name, className = '', size }) => {
  return (
    <ion-icon
      name={name}
      class={className}
      size={size}
    />
  );
};

export default Icon;
