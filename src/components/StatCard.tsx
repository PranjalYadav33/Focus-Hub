import React from 'react';
import { StatCardProps } from '../types/types';

const StatCard: React.FC<StatCardProps> = ({ title, value, color, icon }) => (
  <div className={`p-6 rounded-2xl border bg-card shadow-sm transform hover:scale-[1.01] transition-transform duration-200`}>
    <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <ion-icon name={icon} class="text-2xl text-muted-foreground" />
    </div>
    <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
  </div>
);

export default StatCard;
