import React from 'react';
import { StatCardProps } from '../types/types';

const StatCard: React.FC<StatCardProps> = ({ title, value, color, icon }) => (
  <div className={`p-6 rounded-xl border-4 border-deep-space shadow-[8px_8px_0_#2E294E] ${color} transform hover:scale-105 transition-transform duration-300`}>
    <div className="flex justify-between items-center">
        <h3 className="font-fredoka text-xl text-deep-space">{title}</h3>
<ion-icon name={icon} class="text-4xl text-deep-space opacity-80" />
    </div>
    <p className="font-righteous text-5xl text-white mt-2" style={{ textShadow: '2px 2px 0 #2E294E' }}>{value}</p>
  </div>
);

export default StatCard;
