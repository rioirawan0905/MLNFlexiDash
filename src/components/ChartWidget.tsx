import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { WidgetConfig } from '../types';
import { useDashboard } from '../context/DashboardContext';
import { EditableValue } from './EditableValue';
import { Plus, Trash2 } from 'lucide-react';

interface ChartWidgetProps {
  config: WidgetConfig;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ config }) => {
  const { activeDashboard, isEditMode, updateData, updateWidget } = useDashboard();
  const data = activeDashboard?.data[config.dataKey] || [];
  const chartType = config.options?.chartType || 'bar';
  const showLabels = config.options?.showLabels !== false;

  const addPoint = () => {
    const newData = [...data, { name: 'New Point', value: 0, color: '#3b82f6' }];
    updateData(config.dataKey, newData);
  };

  const removePoint = (index: number) => {
    const newData = data.filter((_: any, i: number) => i !== index);
    updateData(config.dataKey, newData);
  };

  const renderChart = () => {
    if (chartType === 'pie') {
      return (
        <div className="flex-1 w-full min-h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius="40%"
                outerRadius="70%"
                paddingAngle={4}
                dataKey="value"
                cx="50%"
                cy="50%"
                label={showLabels ? { fontSize: 8, fill: 'currentColor' } : false}
              >
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ fontSize: '9px', paddingTop: '10px' }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }

    return (
      <div className="h-[200px] w-full p-2 relative">
        {config.options?.yAxisLabel && (
          <div className="absolute left-0 top-1/2 -rotate-90 origin-left text-[8px] font-bold uppercase opacity-30 tracking-widest -translate-y-1/2">
            {config.options.yAxisLabel}
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} stroke="currentColor" opacity={0.8} className="text-slate-900" />
            <YAxis fontSize={10} axisLine={false} tickLine={false} stroke="currentColor" opacity={0.8} className="text-slate-900" />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} label={showLabels ? { position: 'top', fontSize: 10, fill: 'currentColor' } : false} />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', color: 'currentColor' }} />
          </BarChart>
        </ResponsiveContainer>
        {config.options?.xAxisLabel && (
          <div className="text-center text-[8px] font-bold uppercase opacity-30 tracking-widest mt-1">
            {config.options.xAxisLabel}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-[160px] flex items-center justify-center">
        {renderChart()}
      </div>
      
      {isEditMode && (
        <div className="mt-4 p-4 border-t border-slate-100 bg-slate-50 rounded-xl space-y-4">
          <div className="flex items-center gap-2 px-1">
            <input 
              type="checkbox"
              checked={showLabels}
              onChange={(e) => updateWidget(config.id, { options: { ...config.options, showLabels: e.target.checked } })}
              id={`show-labels-${config.id}`}
              className="accent-blue-500"
            />
            <label htmlFor={`show-labels-${config.id}`} className="text-[10px] font-bold uppercase opacity-40">Show Labels</label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[8px] font-bold uppercase opacity-40">X-Axis Label</label>
              <input 
                value={config.options?.xAxisLabel || ''} 
                onChange={(e) => updateWidget(config.id, { options: { ...config.options, xAxisLabel: e.target.value } })}
                className="w-full bg-transparent border-b border-blue-500/30 outline-none text-[10px] py-1"
                placeholder="e.g. Month"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-bold uppercase opacity-40">Y-Axis Label</label>
              <input 
                value={config.options?.yAxisLabel || ''} 
                onChange={(e) => updateWidget(config.id, { options: { ...config.options, yAxisLabel: e.target.value } })}
                className="w-full bg-transparent border-b border-blue-500/30 outline-none text-[10px] py-1"
                placeholder="e.g. Value"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase font-bold opacity-40">
              <span>Data Points</span>
            <button 
              onClick={addPoint}
              className="hover:text-blue-500 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
            {data.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 group">
                <EditableValue 
                  value={item.name} 
                  dataKey={`${config.dataKey}[${idx}].name`}
                  className="flex-1 text-[10px] uppercase font-bold"
                />
                <EditableValue 
                  value={String(item.value)} 
                  dataKey={`${config.dataKey}[${idx}].value`}
                  className="w-16 text-[10px] font-mono text-right"
                />
                <button 
                  onClick={() => removePoint(idx)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 p-1 hover:bg-red-500/10 rounded transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
