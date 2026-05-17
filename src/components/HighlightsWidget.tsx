import React from 'react';
import { WidgetConfig } from '../types';
import { useDashboard } from '../context/DashboardContext';
import { EditableValue } from './EditableValue';
import { Plus, Trash2 } from 'lucide-react';

interface HighlightsWidgetProps {
  config: WidgetConfig;
}

export const HighlightsWidget: React.FC<HighlightsWidgetProps> = ({ config }) => {
  const { activeDashboard, isEditMode, updateData } = useDashboard();
  const data = activeDashboard?.data[config.dataKey] || [];

  const addItem = (catIndex: number) => {
    const newData = [...data];
    newData[catIndex] = {
      ...newData[catIndex],
      items: [...newData[catIndex].items, 'New Highlight Item']
    };
    updateData(config.dataKey, newData);
  };

  const removeItem = (catIndex: number, itemIndex: number) => {
    const newData = [...data];
    newData[catIndex] = {
      ...newData[catIndex],
      items: newData[catIndex].items.filter((_: any, i: number) => i !== itemIndex)
    };
    updateData(config.dataKey, newData);
  };

  const addCategory = () => {
    const newData = [...data, { category: 'New Category', items: ['New Item'] }];
    updateData(config.dataKey, newData);
  };

  const removeCategory = (index: number) => {
    const newData = data.filter((_: any, i: number) => i !== index);
    updateData(config.dataKey, newData);
  };

  return (
    <div className="p-6 space-y-8">
      {data.map((cat: any, i: number) => (
        <div key={i} className="group/cat space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              <EditableValue 
                value={cat.category} 
                dataKey={`${config.dataKey}[${i}].category`} 
                className="text-[11px] font-bold uppercase tracking-widest text-slate-900"
              />
            </div>
            {isEditMode && (
              <button 
                onClick={() => removeCategory(i)}
                className="opacity-0 group-hover/cat:opacity-100 p-1 text-slate-500 hover:text-red-500 transition-opacity"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
          <ul className="space-y-3 pl-4 border-l border-slate-200">
            {cat.items.map((item: string, j: number) => (
              <li key={j} className="group/item flex items-center gap-2">
                <EditableValue 
                  value={item} 
                  dataKey={`${config.dataKey}[${i}].items[${j}]`} 
                  className="text-[12px] leading-relaxed opacity-90 flex-1 text-slate-800"
                  prefix="▪ "
                />
                {isEditMode && (
                  <button 
                    onClick={() => removeItem(i, j)}
                    className="opacity-0 group-hover/item:opacity-100 p-1 text-slate-500 hover:text-red-500 transition-opacity"
                  >
                    <Trash2 size={10} />
                  </button>
                )}
              </li>
            ))}
            {isEditMode && (
              <li>
                <button 
                  onClick={() => addItem(i)}
                  className="text-[10px] uppercase font-bold text-blue-400/50 hover:text-blue-400 flex items-center gap-1 mt-2 tracking-widest transition-colors"
                >
                  <Plus size={10} /> Add Item
                </button>
              </li>
            )}
          </ul>
        </div>
      ))}
      {isEditMode && (
        <button 
          onClick={addCategory}
          className="w-full mt-4 py-3 border border-dashed border-slate-200 rounded-xl text-[10px] font-bold uppercase text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 tracking-widest"
        >
          <Plus size={16} /> Add Main Highlight
        </button>
      )}
    </div>
  );
};
