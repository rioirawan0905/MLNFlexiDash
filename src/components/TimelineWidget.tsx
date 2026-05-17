import React from 'react';
import { WidgetConfig } from '../types';
import { useDashboard } from '../context/DashboardContext';
import { EditableValue } from './EditableValue';
import { Plus, Trash2, Calendar, Flag } from 'lucide-react';
import { format, differenceInDays, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfQuarter, endOfQuarter, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';

interface TimelineMilestone {
  id: string;
  name: string;
  date: string;
}

interface TimelineItem {
  id: string;
  task: string;
  start: string;
  end: string;
  isMilestone?: boolean;
  milestones?: TimelineMilestone[];
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
      isMilestone: false,
      milestones: []
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

  const addMilestoneToTask = (taskId: string) => {
    const task = data.find((t: TimelineItem) => t.id === taskId);
    if (!task) return;
    
    const newMilestone: TimelineMilestone = {
      id: `m-${Date.now()}`,
      name: 'Milestone',
      date: task.start
    };
    
    updateData(config.dataKey, data.map((item: TimelineItem) => 
      item.id === taskId ? { ...item, milestones: [...(item.milestones || []), newMilestone] } : item
    ));
  };

  const setScale = (newScale: string) => {
    updateWidget(config.id, { options: { ...config.options, scale: newScale } });
  };

  const showBarLabels = config.options?.showBarLabels !== false;
  const widgetHeight = config.options?.height || 400;

  // Basic Gantt Logic
  const allDates = data.flatMap((item: TimelineItem) => {
    const dates = [new Date(item.start), new Date(item.end)];
    if (item.milestones) {
      item.milestones.forEach(m => dates.push(new Date(m.date)));
    }
    return dates;
  });
  
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

  const getIntervals = () => {
    if (scale === 'day') return eachDayOfInterval({ start: minDate, end: maxDate });
    if (scale === 'week') return eachWeekOfInterval({ start: minDate, end: maxDate });
    if (scale === 'quarter') return eachMonthOfInterval({ start: minDate, end: maxDate }).filter((_, i) => i % 3 === 0);
    return eachMonthOfInterval({ start: minDate, end: maxDate });
  };

  const intervals = getIntervals();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div 
        className="flex-1 overflow-auto transition-all duration-300"
        style={{ height: `${widgetHeight}px`, minHeight: '100px' }}
      >
        <div className="min-w-[1000px] p-6">
          {/* Header */}
          <div className="flex items-end border-b border-slate-200 pb-4 mb-2">
            <div className="w-[300px] pr-8">
              <div className="flex justify-between items-center mb-4">
                <span className="font-black text-[10px] uppercase tracking-tighter opacity-40">Project Roadmap</span>
                {isEditMode && (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      {['day', 'week', 'month', 'quarter'].map(s => (
                        <button 
                          key={s}
                          onClick={() => setScale(s)}
                          className={`px-3 py-1 rounded-md text-[8px] font-black uppercase transition-all ${scale === s ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id={`bar-labels-${config.id}`}
                        checked={showBarLabels}
                        onChange={(e) => updateWidget(config.id, { options: { ...config.options, showBarLabels: e.target.checked } })}
                        className="accent-blue-500"
                      />
                      <label htmlFor={`bar-labels-${config.id}`} className="text-[10px] font-bold uppercase opacity-40">Bar Labels</label>
                    </div>
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex justify-between items-center pr-2">
                        <label className="text-[8px] font-black uppercase opacity-30">Widget Height</label>
                        <span className="text-[8px] font-mono text-blue-500 font-bold">{widgetHeight}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="100" 
                        max="1200" 
                        step="50"
                        value={widgetHeight}
                        onChange={(e) => updateWidget(config.id, { options: { ...config.options, height: parseInt(e.target.value) } })}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="font-mono text-[10px] uppercase font-bold opacity-70">Task & Milestones</div>
            </div>
            
            <div className="flex-1 relative h-10 border-l border-slate-200">
              {intervals.map((date, i) => (
                <div 
                  key={i} 
                  className="absolute bottom-0 border-l border-slate-200 h-full"
                  style={{ left: `${getPosition(date.toISOString())}%` }}
                >
                  <span className="absolute -top-6 left-1 text-[9px] font-black text-slate-500 whitespace-nowrap bg-white px-1">
                    {scale === 'day' ? format(date, 'MMM d') : scale === 'week' ? `W${format(date, 'w')} '${format(date, 'yy')}` : format(date, 'MMMM yyyy')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Items */}
          <div className="divide-y divide-slate-100">
            {data.map((item: TimelineItem, idx: number) => {
              const startPos = getPosition(item.start);
              const endPos = getPosition(item.end);
              const width = Math.max(0.5, endPos - startPos);

              return (
                <div key={item.id} className="group flex items-center py-4 bg-white hover:bg-slate-50/50 transition-colors">
                  {/* Task Info */}
                  <div className="w-[300px] pr-8 space-y-1.5">
                    <div className="flex items-center gap-2">
                       {isEditMode && (
                        <div className="flex gap-1">
                          <button 
                            onClick={() => toggleMilestone(item.id)}
                            className={`p-1.5 rounded transition-all ${item.isMilestone ? 'text-yellow-600 bg-yellow-50 shadow-sm' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'}`}
                            title="Toggle Milestone"
                          >
                            <Flag size={11} />
                          </button>
                          <button 
                            onClick={() => addMilestoneToTask(item.id)}
                            className="p-1.5 rounded text-slate-300 hover:text-blue-500 hover:bg-blue-50 transition-all"
                            title="Add Point on Bar"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      )}
                      <EditableValue 
                        value={item.task} 
                        dataKey={`${config.dataKey}[${idx}].task`}
                        className="text-xs font-black text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis tracking-tighter"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-mono text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar size={10} className="opacity-50" />
                        <EditableValue value={item.start} dataKey={`${config.dataKey}[${idx}].start`} />
                        {!item.isMilestone && (
                          <>
                            <span className="opacity-30 mx-1">-</span>
                            <EditableValue value={item.end} dataKey={`${config.dataKey}[${idx}].end`} />
                          </>
                        )}
                      </div>
                      
                      {item.milestones && item.milestones.length > 0 && (
                        <div className="flex items-center gap-2 border-l border-slate-200 pl-2">
                           <Flag size={10} className="text-yellow-500 fill-yellow-500" />
                           <span className="font-bold text-slate-500">{item.milestones.length} points</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bar Area */}
                  <div className="flex-1 relative">
                    <div className="relative h-10 flex items-center group/bar">
                      {/* Vertical Grid lines */}
                      {intervals.map((date, i) => (
                        <div 
                          key={i} 
                          className="absolute inset-y-0 border-l-2 border-slate-200/40 pointer-events-none -mt-4 -mb-4"
                          style={{ left: `${getPosition(date.toISOString())}%` }}
                        />
                      ))}
                      
                      {/* The Bar */}
                      {!item.isMilestone && (
                        <div 
                          className="absolute h-4 rounded-full transition-all duration-700 z-10 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[0_4px_12px_rgba(59,130,246,0.2)] flex items-center"
                          style={{ 
                            left: `${startPos}%`, 
                            width: `${width}%`
                          }}
                        >
                          {showBarLabels && (
                            <span className="absolute left-full ml-3 text-[9px] font-black text-slate-500 whitespace-nowrap opacity-60">
                              {item.task}
                            </span>
                          )}
                          
                          {/* Inner Points/Milestones on Bar */}
                          {item.milestones?.map((m: TimelineMilestone, mIdx: number) => {
                            const mPos = getPosition(m.date);
                            const relativePos = ((mPos - startPos) / width) * 100;
                            return (
                              <div 
                                key={m.id}
                                className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full border-2 border-yellow-500 shadow-sm z-20 group/point"
                                style={{ left: `${relativePos}%` }}
                              >
                                {showBarLabels && (
                                  <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-[7px] font-bold text-yellow-600 whitespace-nowrap bg-white/80 px-1 rounded">
                                    {m.name}
                                  </span>
                                )}
                                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover/point:opacity-100 transition-opacity pointer-events-none">
                                  <div className="bg-slate-900 text-white text-[8px] px-1.5 py-0.5 rounded whitespace-nowrap shadow-xl flex flex-col items-center">
                                    <span className="font-bold">{m.name}</span>
                                    <span className="opacity-60">{format(new Date(m.date), 'MMM d')}</span>
                                  </div>
                                </div>
                                {isEditMode && (
                                  <div className="absolute top-full mt-4 p-2 bg-white border border-slate-200 rounded-lg shadow-xl z-30 opacity-0 group-hover/point:opacity-100 pointer-events-auto">
                                    <EditableValue value={m.name} dataKey={`${config.dataKey}[${idx}].milestones[${mIdx}].name`} className="font-bold text-[8px] mb-1" />
                                    <EditableValue value={m.date} dataKey={`${config.dataKey}[${idx}].milestones[${mIdx}].date`} className="text-[7px] block" />
                                    <button 
                                      onClick={() => {
                                        const newItems = [...data];
                                        newItems[idx].milestones = item.milestones?.filter((_, i) => i !== mIdx);
                                        updateData(config.dataKey, newItems);
                                      }}
                                      className="text-red-500 text-[7px] mt-1 hover:underline"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* Tooltip */}
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-[9px] opacity-0 group-hover/bar:opacity-100 whitespace-nowrap z-30 transition-all pointer-events-none text-white shadow-2xl">
                             <div className="font-black truncate max-w-[150px]">{item.task}</div>
                             <div className="opacity-60 font-mono italic">{format(new Date(item.start), 'MMM d')} — {format(new Date(item.end), 'MMM d')}</div>
                          </div>
                        </div>
                      )}

                      {/* Standalone Milestone */}
                      {item.isMilestone && (
                        <div 
                          className="absolute z-20"
                          style={{ left: `${startPos}%` }}
                        >
                          <div className="w-5 h-5 bg-yellow-500 rotate-45 border-2 border-white shadow-lg -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transform hover:scale-125 transition-transform duration-300">
                             <div className="-rotate-45 text-[8px] text-white">
                                <Flag size={8} fill="white" />
                             </div>
                          </div>
                          {showBarLabels && (
                            <div className="absolute left-4 top-0 -translate-y-1/2 flex flex-col pointer-events-none">
                              <span className="text-[9px] font-black text-slate-700 whitespace-nowrap">{item.task}</span>
                              <span className="text-[7px] font-mono text-slate-400 whitespace-nowrap uppercase">{format(new Date(item.start), 'MMM d, yyyy')}</span>
                            </div>
                          )}
                           {/* Tooltip */}
                           <div className="absolute -top-10 left-0 -translate-x-1/2 bg-yellow-600 px-3 py-1.5 rounded-lg text-[9px] opacity-0 group-hover/bar:opacity-100 whitespace-nowrap z-30 transition-all pointer-events-none text-white shadow-2xl font-black">
                             {item.task}: {format(new Date(item.start), 'MMM d, yyyy')}
                          </div>
                        </div>
                      )}

                      {isEditMode && (
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="absolute -right-8 opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={13} />
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
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <button 
            onClick={addItem}
            className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <Plus size={16} /> Create New Roadmap Entry
          </button>
        </div>
      )}
    </div>
  );
};
