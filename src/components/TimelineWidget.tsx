import React from 'react';
import { WidgetConfig } from '../types';
import { useDashboard } from '../context/DashboardContext';
import { EditableValue } from './EditableValue';
import { Plus, Trash2, Calendar, Flag } from 'lucide-react';
import { format, differenceInDays, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfQuarter, endOfQuarter, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';

interface TimelineItem {
  id: string;
  task: string;
  start: string;
  end: string;
  isMilestone?: boolean;
}

interface TimelineWidgetProps {
  config: WidgetConfig;
}

export const TimelineWidget: React.FC<TimelineWidgetProps> = ({ config }) => {
  const { activeDashboard, isEditMode, updateData, updateWidget } = useDashboard();
  const data = activeDashboard?.data[config.dataKey] || [];
  const scale = config.options?.scale || 'month'; // 'day', 'week', 'month', 'quarter'

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

  const setScale = (newScale: string) => {
    updateWidget(config.id, { options: { ...config.options, scale: newScale } });
  };

  // Basic Gantt Logic
  const allDates = data.flatMap((item: TimelineItem) => [new Date(item.start), new Date(item.end)]);
  
  let minDate: Date;
  let maxDate: Date;

  if (allDates.length > 0) {
    const baseMin = new Date(Math.min(...allDates.map(d => d.getTime())));
    const baseMax = new Date(Math.max(...allDates.map(d => d.getTime())));
    
    if (scale === 'day' || scale === 'week') {
      minDate = startOfWeek(baseMin);
      maxDate = endOfWeek(addDays(baseMax, 7));
    } else if (scale === 'quarter') {
      minDate = startOfQuarter(baseMin);
      maxDate = endOfQuarter(baseMax);
    } else {
      minDate = startOfMonth(baseMin);
      maxDate = endOfMonth(addDays(baseMax, 30));
    }
  } else {
    minDate = startOfMonth(new Date());
    maxDate = endOfMonth(addDays(new Date(), 30));
  }

  const totalDays = Math.max(1, differenceInDays(maxDate, minDate));

  const getPosition = (dateStr: string) => {
    const date = new Date(dateStr);
    const daysSinceStart = differenceInDays(date, minDate);
    return (daysSinceStart / totalDays) * 100;
  };

  const renderGridLines = () => {
    let intervals: Date[] = [];
    if (scale === 'day') {
      intervals = eachDayOfInterval({ start: minDate, end: maxDate });
    } else if (scale === 'week') {
      intervals = eachWeekOfInterval({ start: minDate, end: maxDate });
    } else if (scale === 'quarter') {
      // rough approximation for quarters
      intervals = eachMonthOfInterval({ start: minDate, end: maxDate }).filter((_, i) => i % 3 === 0);
    } else {
      intervals = eachMonthOfInterval({ start: minDate, end: maxDate });
    }

    return intervals.map((date, i) => (
      <div 
        key={i} 
        className="absolute inset-y-0 border-l border-slate-200/60 pointer-events-none"
        style={{ left: `${getPosition(date.toISOString())}%` }}
      >
        <span className="absolute top-[-20px] left-1 text-[8px] font-bold text-slate-400 whitespace-nowrap">
          {scale === 'day' ? format(date, 'd') : scale === 'week' ? `W${format(date, 'w')}` : format(date, 'MMM')}
        </span>
      </div>
    ));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-x-auto min-h-[300px]">
        <div className="min-w-[800px] p-4 pt-10">
          {/* Header */}
          <div className="flex border-b border-slate-200 pb-2 mb-4 font-mono text-[10px] uppercase font-bold opacity-70">
            <div className="w-1/4 text-slate-900">Task Details</div>
            <div className="w-3/4 pl-8 text-slate-900 flex justify-between items-center">
              <span>Timeline ({format(minDate, 'MMM d, yyyy')} - {format(maxDate, 'MMM d, yyyy')})</span>
              {isEditMode && (
                <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg">
                  {['day', 'week', 'month', 'quarter'].map(s => (
                    <button 
                      key={s}
                      onClick={() => setScale(s)}
                      className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase transition-all ${scale === s ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            {data.map((item: TimelineItem, idx: number) => {
              const startPos = getPosition(item.start);
              const endPos = getPosition(item.end);
              const width = Math.max(1.5, endPos - startPos);

              return (
                <div key={item.id} className="group flex items-center">
                  {/* Info */}
                  <div className="w-1/4 space-y-1">
                    <div className="flex items-center gap-2">
                       {isEditMode && (
                        <button 
                          onClick={() => toggleMilestone(item.id)}
                          className={`p-1 rounded transition-colors ${item.isMilestone ? 'text-yellow-600 bg-yellow-50' : 'text-slate-400 hover:bg-slate-100'}`}
                          title="Toggle Milestone"
                        >
                          <Flag size={12} />
                        </button>
                      )}
                      <EditableValue 
                        value={item.task} 
                        dataKey={`${config.dataKey}[${idx}].task`}
                        className="text-[11px] font-bold text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis"
                      />
                    </div>
                    <div className="flex items-center gap-4 text-[9px] opacity-70 font-mono text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={10} />
                        <EditableValue value={item.start} dataKey={`${config.dataKey}[${idx}].start`} />
                        {!item.isMilestone && (
                          <>
                            <span>-</span>
                            <EditableValue value={item.end} dataKey={`${config.dataKey}[${idx}].end`} />
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bar Area */}
                  <div className="w-3/4 pl-8">
                    <div className="relative h-8 flex items-center group/bar">
                      {/* Grid lines */}
                      {renderGridLines()}
                      
                      {/* The Bar */}
                      <div 
                        className={`absolute h-3 rounded-full transition-all duration-500 z-10 ${item.isMilestone ? 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]'}`}
                        style={{ 
                          left: `${startPos}%`, 
                           width: item.isMilestone ? '0px' : `${width}%`
                        }}
                      >
                        {/* Milestone Marker */}
                        {item.isMilestone && (
                          <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-yellow-500 rotate-45 border-2 border-white shadow-lg" />
                        )}

                        {/* Tooltip on hover */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[8px] opacity-0 group-hover:opacity-100 whitespace-nowrap z-20 transition-opacity pointer-events-none text-white font-bold">
                          {item.task}: {format(new Date(item.start), 'MMM d')} {!item.isMilestone && `- ${format(new Date(item.end), 'MMM d')}`}
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
          className="w-full mt-4 py-3 border border-dashed border-slate-200 rounded-xl text-[10px] font-bold uppercase text-slate-400 hover:text-blue-500 hover:border-blue-500/50 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Add Timeline Task
        </button>
      )}
    </div>
  );
};
