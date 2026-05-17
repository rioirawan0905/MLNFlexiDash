import React from 'react';
import { WidgetConfig } from '../types';
import { useDashboard } from '../context/DashboardContext';
import { EditableValue } from './EditableValue';
import { Plus, Trash2, Calendar, Link as LinkIcon, Flag } from 'lucide-react';
import { format, differenceInDays, addDays, startOfMonth, endOfMonth } from 'date-fns';

interface TimelineItem {
  id: string;
  task: string;
  start: string;
  end: string;
  predecessor?: string;
  isMilestone?: boolean;
}

interface TimelineWidgetProps {
  config: WidgetConfig;
}

export const TimelineWidget: React.FC<TimelineWidgetProps> = ({ config }) => {
  const { activeDashboard, isEditMode, updateData } = useDashboard();
  const data = activeDashboard?.data[config.dataKey] || [];

  const addItem = () => {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = addDays(new Date(), 7).toISOString().split('T')[0];
    const newItem: TimelineItem = {
      id: `task-${Date.now()}`,
      task: 'New Task',
      start: today,
      end: nextWeek,
      isMilestone: false
    };
    updateData(config.dataKey, [...data, newItem]);
  };

  const removeItem = (id: string) => {
    updateData(config.dataKey, data.filter((item: TimelineItem) => item.id !== id));
  };

  const toggleMilestone = (id: string) => {
    updateData(config.dataKey, data.map((item: TimelineItem) => 
      item.id === id ? { ...item, isMilestone: !item.isMilestone } : item
    ));
  };

  // Basic Gantt Logic
  const allDates = data.flatMap((item: TimelineItem) => [new Date(item.start), new Date(item.end)]);
  const minDate = allDates.length > 0 ? startOfMonth(new Date(Math.min(...allDates.map(d => d.getTime())))) : startOfMonth(new Date());
  const maxDate = allDates.length > 0 ? endOfMonth(addDays(new Date(Math.max(...allDates.map(d => d.getTime()))), 30)) : endOfMonth(addDays(new Date(), 30));
  const totalDays = Math.max(1, differenceInDays(maxDate, minDate));

  const getPosition = (dateStr: string) => {
    const date = new Date(dateStr);
    const daysSinceStart = differenceInDays(date, minDate);
    return (daysSinceStart / totalDays) * 100;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-x-auto min-h-[300px]">
        <div className="min-w-[800px] p-4">
          {/* Header */}
          <div className="flex border-b border-white/5 pb-2 mb-4 font-mono text-[10px] uppercase font-bold opacity-40">
            <div className="w-1/3">Task Details</div>
            <div className="w-2/3 pl-8">Timeline ({format(minDate, 'MMM yyyy')} - {format(maxDate, 'MMM yyyy')})</div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            {data.map((item: TimelineItem, idx: number) => {
              const startPos = getPosition(item.start);
              const endPos = getPosition(item.end);
              const width = Math.max(2, endPos - startPos);

              return (
                <div key={item.id} className="group flex items-center">
                  {/* Info */}
                  <div className="w-1/3 space-y-1">
                    <div className="flex items-center gap-2">
                       {isEditMode && (
                        <button 
                          onClick={() => toggleMilestone(item.id)}
                          className={`p-1 rounded transition-colors ${item.isMilestone ? 'text-yellow-500 bg-yellow-500/10' : 'text-slate-500 hover:bg-white/5'}`}
                          title="Toggle Milestone"
                        >
                          <Flag size={12} />
                        </button>
                      )}
                      <EditableValue 
                        value={item.task} 
                        dataKey={`${config.dataKey}[${idx}].task`}
                        className="text-[11px] font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="flex items-center gap-4 text-[9px] opacity-40 font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar size={10} />
                        <EditableValue value={item.start} dataKey={`${config.dataKey}[${idx}].start`} />
                        <span>-</span>
                        <EditableValue value={item.end} dataKey={`${config.dataKey}[${idx}].end`} />
                      </div>
                      <div className="flex items-center gap-1">
                        <LinkIcon size={10} />
                        <EditableValue 
                          value={item.predecessor || 'None'} 
                          dataKey={`${config.dataKey}[${idx}].predecessor`} 
                          prefix="Pre: "
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bar Area */}
                  <div className="w-2/3 pl-8">
                    <div className="relative h-8 flex items-center group/bar">
                      {/* Grid line */}
                      <div className="absolute inset-y-0 left-0 right-0 border-l border-white/5 pointer-events-none" />
                      
                      {/* The Bar */}
                      <div 
                        className={`absolute h-2 rounded-full transition-all duration-500 ${item.isMilestone ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]'}`}
                        style={{ 
                          left: `${startPos}%`, 
                          width: `${width}%`
                        }}
                      >
                        {/* Milestone Marker */}
                        {item.isMilestone && (
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-yellow-500 rotate-45 border-2 border-white dark:border-[#020617]" />
                        )}

                        {/* Tooltip on hover */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 px-2 py-1 rounded text-[8px] opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 transition-opacity pointer-events-none text-white">
                          {item.task}: {format(new Date(item.start), 'MMM d')} - {format(new Date(item.end), 'MMM d')}
                        </div>
                      </div>

                      {isEditMode && (
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="absolute -right-6 opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-500/10 rounded transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isEditMode && (
        <button 
          onClick={addItem}
          className="w-full mt-4 py-3 border border-dashed border-white/10 rounded-xl text-[10px] font-bold uppercase text-slate-500 hover:text-blue-400 hover:border-blue-400/50 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Add Timeline Task
        </button>
      )}
    </div>
  );
};
