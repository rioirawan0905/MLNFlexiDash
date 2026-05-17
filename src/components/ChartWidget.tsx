import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar, Label, Sector } from 'recharts';
import { WidgetConfig } from '../types';
import { useDashboard } from '../context/DashboardContext';
import { EditableValue } from './EditableValue';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface ChartWidgetProps {
  config: WidgetConfig;
}

// Custom Radar Tick for better wrapping
const renderPolarAngleAxisTick = ({ payload, x, y, cx, cy, verticalAnchor, horizontalAnchor, ...rest }: any) => {
  const { value } = payload;
  const words = value.split(' ');
  const lines = words.length > 2 ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')] : [value];

  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line: string, i: number) => (
        <text
          key={i}
          {...rest}
          fill="#64748b"
          fontWeight="bold"
          textAnchor={x > cx ? "start" : x < cx ? "end" : "middle"}
          dominantBaseline="central"
          y={i * 10 - (lines.length - 1) * 5}
        >
          {line}
        </text>
      ))}
    </g>
  );
};

export const ChartWidget: React.FC<ChartWidgetProps> = ({ config }) => {
  const { activeDashboard, isEditMode, updateData, updateWidget } = useDashboard();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  const data = activeDashboard?.data[config.dataKey] || [];
  const chartType = config.options?.chartType || 'bar';
  const showLabels = config.options?.showLabels !== false;
  const showLegend = config.options?.showLegend !== false;
  const legendAlign = config.options?.legendAlign || 'center';
  const legendVerticalAlign = config.options?.legendVerticalAlign || 'bottom';

  const addPoint = () => {
    const newData = [...data, { name: 'New Point', value: 0, color: '#3b82f6' }];
    updateData(config.dataKey, newData);
  };

  const removePoint = (index: number) => {
    const newData = data.filter((_: any, i: number) => i !== index);
    updateData(config.dataKey, newData);
  };

  const movePoint = (index: number, direction: 'up' | 'down') => {
    const newData = [...data];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newData.length) return;
    
    [newData[index], newData[targetIndex]] = [newData[targetIndex], newData[index]];
    updateData(config.dataKey, newData);
  };

  const renderChart = () => {
    const COLORS = ['#3b82f6', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];
    const isVerticalLegend = legendAlign === 'left' || legendAlign === 'right';

    // Ensure all data point values are numbers for proper chart rendering
    const chartData = data.map((item: any) => ({
      ...item,
      value: Number(item.value) || 0
    }));

    if (chartType === 'radar') {
      return (
        <div className="h-[200px] w-full p-2 relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis 
                dataKey="name" 
                tick={renderPolarAngleAxisTick}
                fontSize={9}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid rgba(0,0,0,0.1)', 
                  borderRadius: '12px', 
                  fontSize: '10px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}
                itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
              />
              <Radar
                name="Value"
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
                label={showLabels ? { fontSize: 8, fill: '#3b82f6', fontWeight: 'bold' } : false}
              />
              {showLegend && (
                <Legend 
                  align={legendAlign}
                  verticalAlign={isVerticalLegend ? 'middle' : legendVerticalAlign}
                  layout={isVerticalLegend ? 'vertical' : 'horizontal'}
                  wrapperStyle={{ 
                    fontSize: '9px', 
                    paddingTop: isVerticalLegend ? '0' : '10px',
                    width: isVerticalLegend ? '30%' : 'auto'
                  }}
                  formatter={(value) => <span className="text-slate-500 font-medium truncate max-w-[80px] inline-block align-middle">{value}</span>}
                />
              )}
            </RadarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (chartType === 'pie') {
      const renderActiveShape = (props: any) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
        return (
          <g>
            <Sector
              cx={cx}
              cy={cy}
              innerRadius={innerRadius}
              outerRadius={outerRadius + 8}
              startAngle={startAngle}
              endAngle={endAngle}
              fill={fill}
              className="drop-shadow-lg transition-all duration-300"
            />
          </g>
        );
      };

      return (
        <div className="h-[200px] w-full p-2 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius="40%"
                outerRadius="75%"
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                label={showLabels ? { fontSize: 9, fill: '#64748b', fontWeight: 'bold' } : false}
                {...{
                  activeIndex: activeIndex !== null ? activeIndex : undefined,
                  activeShape: renderActiveShape
                } as any}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {chartData.map((entry: any, index: number) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || COLORS[index % COLORS.length]} 
                    className="transition-all duration-300 cursor-pointer"
                    stroke="white"
                    strokeWidth={activeIndex === index ? 2 : 0}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontSize: '10px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}
                itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
              />
              {showLegend && (
                <Legend 
                  align={legendAlign}
                  verticalAlign={isVerticalLegend ? 'middle' : legendVerticalAlign}
                  layout={isVerticalLegend ? 'vertical' : 'horizontal'}
                  wrapperStyle={{ 
                    fontSize: '9px', 
                    paddingTop: isVerticalLegend ? '0' : '10px',
                    width: isVerticalLegend ? '35%' : 'auto',
                    maxWidth: isVerticalLegend ? '120px' : 'none'
                  }} 
                  formatter={(value: string, entry: any) => {
                    const index = chartData.findIndex(d => d.name === value);
                    const isActive = activeIndex === index;
                    return (
                      <span 
                        className={`inline-block align-middle transition-all duration-200 cursor-pointer ${isActive ? 'font-black scale-105 text-slate-900' : 'text-slate-500 font-medium'} max-w-[80px] leading-tight break-words`}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                      >
                        {value}
                      </span>
                    );
                  }}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }

    return (
      <div className="h-[200px] w-full p-2 relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} stroke="currentColor" opacity={0.8} className="text-slate-900">
               {config.options?.xAxisLabel && (
                 <Label value={config.options.xAxisLabel} offset={0} position="insideBottom" fontSize={8} fontWeight="bold" opacity={0.5} />
               )}
            </XAxis>
            <YAxis fontSize={10} axisLine={false} tickLine={false} stroke="currentColor" opacity={0.8} className="text-slate-900">
              {config.options?.yAxisLabel && (
                <Label value={config.options.yAxisLabel} angle={-90} position="insideLeft" offset={5} style={{ textAnchor: 'middle' }} fontSize={8} fontWeight="bold" opacity={0.5} />
              )}
            </YAxis>
            <Tooltip 
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid rgba(0,0,0,0.1)', 
                borderRadius: '12px', 
                fontSize: '10px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)'
              }}
              itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
            />
            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} label={showLabels ? { position: 'top', fontSize: 10, fill: 'currentColor' } : false} />
            {showLegend && (
              <Legend 
                align={legendAlign}
                verticalAlign={isVerticalLegend ? 'middle' : legendVerticalAlign}
                layout={isVerticalLegend ? 'vertical' : 'horizontal'}
                wrapperStyle={{ 
                  fontSize: '9px', 
                  paddingTop: isVerticalLegend ? '0' : '10px',
                  width: isVerticalLegend ? '30%' : 'auto'
                }} 
                formatter={(value) => <span className="text-slate-500 font-medium truncate max-w-[80px] inline-block align-middle">{value}</span>}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
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
          <div className="grid grid-cols-2 gap-4">
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
            <div className="flex items-center gap-2 px-1">
              <input 
                type="checkbox"
                checked={showLegend}
                onChange={(e) => updateWidget(config.id, { options: { ...config.options, showLegend: e.target.checked } })}
                id={`show-legend-${config.id}`}
                className="accent-blue-500"
              />
              <label htmlFor={`show-legend-${config.id}`} className="text-[10px] font-bold uppercase opacity-40">Show Legend</label>
            </div>
          </div>

          {showLegend && (
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                <label className="text-[8px] font-bold uppercase opacity-40">Legend Align</label>
                <select 
                  value={legendAlign} 
                  onChange={(e) => updateWidget(config.id, { options: { ...config.options, legendAlign: e.target.value } })}
                  className="w-full bg-transparent border-b border-blue-500/30 outline-none text-[10px] py-1"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold uppercase opacity-40">Legend Vertical</label>
                <select 
                  value={legendVerticalAlign} 
                  onChange={(e) => updateWidget(config.id, { options: { ...config.options, legendVerticalAlign: e.target.value } })}
                  className="w-full bg-transparent border-b border-blue-500/30 outline-none text-[10px] py-1"
                >
                  <option value="top">Top</option>
                  <option value="middle">Middle</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>
            </div>
          )}

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
                <div className="flex items-center">
                  <button 
                    onClick={() => movePoint(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-slate-400 hover:text-blue-500 disabled:opacity-20 translate-y-[2px]"
                  >
                    <ArrowUp size={10} />
                  </button>
                  <button 
                    onClick={() => movePoint(idx, 'down')}
                    disabled={idx === data.length - 1}
                    className="p-1 text-slate-400 hover:text-blue-500 disabled:opacity-20 translate-y-[2px]"
                  >
                    <ArrowDown size={10} />
                  </button>
                </div>
                <EditableValue 
                  value={item.name} 
                  dataKey={`${config.dataKey}[${idx}].name`}
                  className="flex-1 text-[10px] uppercase font-bold"
                />
                <EditableValue 
                  value={item.value} 
                  dataKey={`${config.dataKey}[${idx}].value`}
                  className="w-16 text-[10px] font-mono text-right"
                />
                <div className="relative group/color">
                  <input 
                    type="color" 
                    value={item.color || '#3b82f6'} 
                    onChange={(e) => updateData(`${config.dataKey}[${idx}].color`, e.target.value)}
                    className="w-4 h-4 rounded-full border-none cursor-pointer"
                  />
                </div>
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

