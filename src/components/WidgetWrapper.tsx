import React, { useState } from 'react';
import { WidgetConfig } from '../types';
import { useDashboard } from '../context/DashboardContext';
import { MetricWidget } from './MetricWidget';
import { ChartWidget } from './ChartWidget';
import { TableWidget } from './TableWidget';
import { HighlightsWidget } from './HighlightsWidget';
import { TimelineWidget } from './TimelineWidget';
import { ProgressWidget } from './ProgressWidget';
import { ErrorBoundary } from './ErrorBoundary';
import { Settings, Trash2, GripVertical, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface WidgetWrapperProps {
  config: WidgetConfig;
}

export const WidgetWrapper: React.FC<WidgetWrapperProps> = ({ config }) => {
  const { isEditMode, updateWidget, deleteWidget } = useDashboard();
  const [showSettings, setShowSettings] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: config.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const renderContent = () => {
    switch (config.type) {
      case 'metric': return <MetricWidget config={config} />;
      case 'chart': return <ChartWidget config={config} />;
      case 'table': return <TableWidget config={config} />;
      case 'highlights': return <HighlightsWidget config={config} />;
      case 'timeline': return <TimelineWidget config={config} />;
      case 'progress': return <ProgressWidget config={config} />;
      default: return <div>Unknown widget type</div>;
    }
  };

  const changeSpan = (delta: number) => {
    const spans = ['col-span-1', 'col-span-2', 'col-span-3', 'col-span-4', 'col-span-5', 'col-span-6', 'col-span-7', 'col-span-8', 'col-span-full'];
    const current = config.gridSpan || 'col-span-2';
    let index = spans.indexOf(current);
    if (index === -1) index = 1; // default to 2
    
    let nextIndex = index + delta;
    if (nextIndex < 0) nextIndex = 0;
    if (nextIndex >= spans.length) nextIndex = spans.length - 1;
    
    updateWidget(config.id, { gridSpan: spans[nextIndex] });
  };

  const changeRowSpan = (delta: number) => {
    const spans = ['row-span-1', 'row-span-2', 'row-span-3', 'row-span-4'];
    const current = config.rowSpan || 'row-span-1';
    let index = spans.indexOf(current);
    if (index === -1) index = 0;
    
    let nextIndex = index + delta;
    if (nextIndex < 0) nextIndex = 0;
    if (nextIndex >= spans.length) nextIndex = spans.length - 1;
    
    updateWidget(config.id, { rowSpan: spans[nextIndex] });
  };

  const toggleChartType = () => {
    if (config.type !== 'chart') return;
    const types = ['bar', 'stacked_bar', 'line', 'pie', 'radar'];
    const current = config.options?.chartType || 'bar';
    const nextIndex = (types.indexOf(current) + 1) % types.length;
    updateWidget(config.id, { options: { ...config.options, chartType: types[nextIndex] } });
  };

  const toggleTextColor = () => {
    const colors = ['', 'text-blue-500', 'text-emerald-500', 'text-rose-500', 'text-amber-500', 'text-violet-500', 'text-slate-900 font-black'];
    const current = config.options?.textColor || '';
    const nextIndex = (colors.indexOf(current) + 1) % colors.length;
    updateWidget(config.id, { options: { ...config.options, textColor: colors[nextIndex] } });
  };

  return (
    <motion.div 
      ref={setNodeRef}
      style={style}
      layout
      className={cn(
        "widget-card transition-all group", 
        config.gridSpan,
        config.rowSpan,
        config.options?.textColor,
        isDragging && "opacity-50 scale-95 shadow-none border-blue-500/50"
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="widget-header">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {isEditMode && <GripVertical size={12} className="text-slate-500 cursor-grab active:cursor-grabbing shrink-0" {...attributes} {...listeners} />}
          {isEditMode ? (
            <input 
              value={config.title}
              onChange={(e) => updateWidget(config.id, { title: e.target.value })}
              className="bg-transparent border-b border-blue-500/30 outline-none widget-title opacity-100 text-slate-900 w-full min-w-[50px]"
            />
          ) : (
            <span className="widget-title text-slate-900 leading-tight break-words">{config.title}</span>
          )}
        </div>
        
        {isEditMode && (
          <div className="flex gap-1 items-center ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {config.type === 'chart' && (
              <button 
                onClick={toggleChartType}
                className="p-1 text-slate-500 hover:text-blue-500 hover:bg-blue-50 rounded transition-all text-[9px] font-bold font-mono"
                title="Switch Chart Type"
              >
                {(config.options?.chartType || 'bar').toUpperCase()}
              </button>
            )}
            <button 
              onClick={toggleTextColor}
              className="p-1 text-slate-500 hover:text-blue-500 hover:bg-blue-50 rounded transition-all"
              title="Change Text Color"
            >
              <div className={cn("w-2.5 h-2.5 rounded-full border border-black/10", 
                config.options?.textColor?.includes('blue') ? 'bg-blue-500' : 
                config.options?.textColor?.includes('emerald') ? 'bg-emerald-500' : 
                config.options?.textColor?.includes('rose') ? 'bg-rose-500' : 
                config.options?.textColor?.includes('amber') ? 'bg-amber-500' : 
                config.options?.textColor?.includes('violet') ? 'bg-violet-500' : 
                config.options?.textColor?.includes('slate') ? 'bg-slate-900' : 'bg-slate-400'
              )} />
            </button>
            <button 
              onClick={() => changeSpan(-1)}
              className="p-1 text-slate-500 hover:text-blue-500 hover:bg-blue-50 rounded transition-all disabled:opacity-20"
              title="Shrink Widget"
              disabled={config.gridSpan === 'col-span-1'}
            >
              <Minimize2 size={11} />
            </button>
            <button 
              onClick={() => changeSpan(1)}
              className="p-1 text-slate-500 hover:text-blue-500 hover:bg-blue-50 rounded transition-all disabled:opacity-20"
              title="Expand Widget Width"
              disabled={config.gridSpan === 'col-span-full'}
            >
              <Maximize2 size={11} />
            </button>
            <div className="h-4 w-[1px] bg-slate-200 mx-0.5" />
            <button 
              onClick={() => changeRowSpan(-1)}
              className="p-1 text-slate-500 hover:text-blue-500 hover:bg-blue-50 rounded transition-all disabled:opacity-20 flex flex-col items-center"
              title="Shrink Widget Height"
              disabled={config.rowSpan === 'row-span-1'}
            >
              <div className="flex flex-col gap-0.5">
                <Minimize2 size={11} className="rotate-90" />
              </div>
            </button>
            <button 
              onClick={() => changeRowSpan(1)}
              className="p-1 text-slate-500 hover:text-blue-500 hover:bg-blue-50 rounded transition-all disabled:opacity-20 flex flex-col items-center"
              title="Expand Widget Height"
              disabled={config.rowSpan === 'row-span-4'}
            >
              <div className="flex flex-col gap-0.5">
                <Maximize2 size={11} className="rotate-90" />
              </div>
            </button>
            <button 
              onClick={() => deleteWidget(config.id)}
              className="p-1 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
              title="Delete Widget"
            >
              <Trash2 size={11} />
            </button>
          </div>
        )}
      </div>
      <div className="flex-1 relative overflow-hidden">
        <ErrorBoundary>
          {renderContent()}
        </ErrorBoundary>
      </div>
    </motion.div>
  );
};
