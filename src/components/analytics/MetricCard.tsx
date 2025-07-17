import React from 'react';
import { useState } from 'react';
import { DivideIcon as LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { MetricDataModal } from './MetricDataModal';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color
}) => {
  const [showModal, setShowModal] = useState(false);

  const colorClasses = {
    blue: 'text-primary-600',
    green: 'text-primary-700',
    purple: 'text-primary-800',
    orange: 'text-primary-500'
  };

  return (
    <>
      <div 
        onClick={() => setShowModal(true)}
        className="neumorphic-metric group cursor-pointer"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
          </div>
          <div className="neumorphic-stat w-16 h-16 flex items-center justify-center">
            <Icon className={`w-8 h-8 ${colorClasses[color]} group-hover:scale-110 transition-transform duration-300`} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {trend === 'up' ? (
              <div className="neumorphic-badge bg-green-100 text-green-800 flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span className="text-xs font-medium">{change}</span>
              </div>
            ) : (
              <div className="neumorphic-badge bg-red-100 text-red-800 flex items-center space-x-1">
                <TrendingDown className="w-3 h-3" />
                <span className="text-xs font-medium">{change}</span>
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500">from last period</span>
        </div>
      </div>
      
      <MetricDataModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={title}
        value={value}
        change={change}
        trend={trend}
      />
    </>
  );
};