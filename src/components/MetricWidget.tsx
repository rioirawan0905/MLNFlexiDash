import React from 'react';
import { WidgetConfig } from '../types';
import { useDashboard } from '../context/DashboardContext';
import { EditableValue } from './EditableValue';
import { cn } from '../lib/utils';

interface MetricWidgetProps {
  config: WidgetConfig;
}

export const MetricWidget: React.FC<MetricWidgetProps> = ({ config }) => {
  const { activeDashboard } = useDashboard();
  const data = activeDashboard?.data[config.dataKey] || { value: 0 };

  return (
    <div className="flex flex-col h-full justify-between p-6">
      <div className="space-y-1">
        {data.label !== undefined && (
          <EditableValue 
            value={data.label} 
            dataKey={`${config.dataKey}.label`}
            className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-50" 
          />
        )}
        <div className="flex items-baseline gap-2">
          <EditableValue 
            value={data.value} 
            dataKey={`${config.dataKey}.value`}
            className="text-5xl font-bold tracking-tighter text-slate-900" 
          />
        </div>
      </div>
      
      {data.trend !== undefined && (
        <div className="flex items-center gap-1.5 mt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <div className="flex items-center text-[11px] font-bold uppercase tracking-widest">
            <EditableValue 
              value={data.trend} 
              dataKey={`${config.dataKey}.trend`}
              className="px-1"
            />
          </div>
        </div>
      )}
    </div>
  );
};
