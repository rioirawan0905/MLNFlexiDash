import React from 'react';
import { WidgetConfig } from '../types';
import { useDashboard } from '../context/DashboardContext';
import { EditableValue } from './EditableValue';
import { motion } from 'motion/react';

interface ProgressWidgetProps {
  config: WidgetConfig;
}

export const ProgressWidget: React.FC<ProgressWidgetProps> = ({ config }) => {
  const { activeDashboard } = useDashboard();
  const data = activeDashboard?.data[config.dataKey] || { percentage: 0, status: 'N/A' };

  const percentage = Math.min(100, Math.max(0, Number(data.percentage)));

  return (
    <div className="flex flex-col h-full p-4 justify-center">
      <div className="flex justify-between items-end mb-4">
        <div className="space-y-1">
          <EditableValue 
            value={data.status} 
            dataKey={`${config.dataKey}.status`}
            className="text-[10px] font-bold uppercase opacity-40 tracking-widest"
          />
          <div className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white flex items-baseline gap-1">
            <EditableValue value={String(data.percentage)} dataKey={`${config.dataKey}.percentage`} />
            <span className="text-xl opacity-20">%</span>
          </div>
        </div>
      </div>

      <div className="relative h-4 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
        <motion.div 
          className="absolute inset-y-0 left-0 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        
        {/* Zebra effect */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]" />
      </div>
      
      <div className="flex justify-between mt-2 text-[8px] font-mono opacity-30 font-bold uppercase tracking-widest">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
};
