import React from 'react';
import { WidgetConfig } from '../types';
import { useDashboard } from '../context/DashboardContext';
import { EditableValue } from './EditableValue';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface TableWidgetProps {
  config: WidgetConfig;
}

export const TableWidget: React.FC<TableWidgetProps> = ({ config }) => {
  const { activeDashboard, isEditMode, updateData, updateWidget } = useDashboard();
  const data = activeDashboard?.data[config.dataKey] || { columns: [], rows: [] };

  const addRow = () => {
    const newRow = { ...data.rows[0] };
    Object.keys(newRow).forEach(key => newRow[key] = 'New Data');
    updateData(config.dataKey, {
      ...data,
      rows: [...data.rows, newRow]
    });
  };

  const addColumn = () => {
    const newColName = `Column ${data.columns.length + 1}`;
    const newColumns = [...data.columns, newColName];
    const newRows = data.rows.map((row: any) => ({
      ...row,
      [newColName]: 'Data'
    }));
    updateData(config.dataKey, {
      columns: newColumns,
      rows: newRows
    });
  };

  const removeRow = (index: number) => {
    updateData(config.dataKey, {
      ...data,
      rows: data.rows.filter((_: any, i: number) => i !== index)
    });
  };

  const removeColumn = (colName: string) => {
    const newColumns = data.columns.filter((c: string) => c !== colName);
    const newRows = data.rows.map((row: any) => {
      const { [colName]: _, ...rest } = row;
      return rest;
    });
    updateData(config.dataKey, {
      columns: newColumns,
      rows: newRows
    });
  };

  const renameColumn = (oldName: string, newName: string) => {
    if (oldName === newName || !newName) return;
    
    const newColumns = data.columns.map((c: string) => c === oldName ? newName : c);
    const newRows = data.rows.map((row: any) => {
      const newRow = { ...row };
      newRow[newName] = row[oldName];
      delete newRow[oldName];
      return newRow;
    });

    updateData(config.dataKey, {
      columns: newColumns,
      rows: newRows
    });
  };

  const moveColumn = (index: number, direction: 'left' | 'right') => {
    const newColumns = [...data.columns];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newColumns.length) return;
    
    [newColumns[index], newColumns[targetIndex]] = [newColumns[targetIndex], newColumns[index]];
    updateData(config.dataKey, { ...data, columns: newColumns });
  };

  const getStatusIcon = (value: string) => {
    const val = value.toLowerCase();
    if (val.includes('done') || val.includes('completed') || val.includes('success')) return '✅';
    if (val.includes('progress') || val.includes('going')) return '🔵';
    if (val.includes('todo') || val.includes('planned')) return '⚪';
    if (val.includes('blocked') || val.includes('error')) return '❌';
    if (val.includes('warning') || val.includes('risk')) return '⚠️';
    return null;
  };

  const showStatusIcons = config.options?.showStatusIcons !== false;

  return (
    <div className="overflow-x-auto p-2">
      <div className={isEditMode ? "mb-4 space-y-4" : ""}>
        {isEditMode && (
          <div className="flex items-center gap-4 px-2">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id={`status-icons-${config.id}`}
                checked={showStatusIcons}
                onChange={(e) => updateWidget(config.id, { options: { ...config.options, showStatusIcons: e.target.checked } })}
                className="accent-blue-500"
              />
              <label htmlFor={`status-icons-${config.id}`} className="text-[10px] font-bold uppercase opacity-40">Status Icons</label>
            </div>
          </div>
        )}
      <table className="w-full text-left text-[11px] font-mono min-w-[600px] table-fixed">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 italic">
            {data.columns.map((col: string, idx: number) => (
              <th key={idx} className="px-4 py-2 font-bold opacity-80 group/th" style={{ width: config.options?.columnWidths?.[col] || 'auto' }}>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <EditableValue 
                      value={col} 
                      dataKey={`${config.dataKey}.columns[${idx}]`}
                      onSave={(val) => renameColumn(col, String(val))}
                      className="text-[10px] font-bold text-slate-900 normal-case tracking-normal truncate"
                    />
                    {isEditMode && (
                      <div className="flex items-center opacity-0 group-hover/th:opacity-100 transition-opacity">
                        <button 
                          onClick={() => moveColumn(idx, 'left')}
                          disabled={idx === 0}
                          className="p-1 hover:text-blue-500 disabled:opacity-20"
                        >
                          <ChevronLeft size={10} />
                        </button>
                        <button 
                          onClick={() => moveColumn(idx, 'right')}
                          disabled={idx === data.columns.length - 1}
                          className="p-1 hover:text-blue-500 disabled:opacity-20"
                        >
                          <ChevronRight size={10} />
                        </button>
                        {data.columns.length > 1 && (
                          <button 
                            onClick={() => removeColumn(col)}
                            className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                          >
                            <Trash2 size={10} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {isEditMode && (
                    <div className="flex items-center gap-1 opacity-0 group-hover/th:opacity-100">
                      <span className="text-[8px] opacity-30">Width:</span>
                      <input 
                        type="text" 
                        value={config.options?.columnWidths?.[col] || 'auto'} 
                        onChange={(e) => updateWidget(config.id, { 
                          options: { 
                            ...config.options, 
                            columnWidths: { ...config.options?.columnWidths, [col]: e.target.value } 
                          } 
                        })}
                        placeholder="e.g. 150px"
                        className="bg-transparent border-none outline-none text-[8px] w-full text-blue-500"
                      />
                    </div>
                  )}
                </div>
              </th>
            ))}
            {isEditMode && (
              <th className="px-4 py-2 opacity-40 uppercase tracking-wider">
                <button 
                  onClick={addColumn}
                  className="p-1 hover:text-blue-500 transition-colors"
                  title="Add Column"
                >
                  <Plus size={14} />
                </button>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row: any, i: number) => (
            <tr key={i} className="group border-b border-slate-100 hover:bg-slate-50 transition-colors">
              {data.columns.map((col: string) => {
                const value = String(row[col] || '');
                const icon = getStatusIcon(value);
                
                return (
                  <td key={col} className="px-4 py-3 align-top">
                    <div className="flex items-start gap-2">
                      {showStatusIcons && icon && (
                        <span className="text-[14px] mt-[-2px]">{icon}</span>
                      )}
                      <EditableValue 
                        value={row[col]} 
                        dataKey={`${config.dataKey}.rows[${i}].${col}`} 
                        className="text-slate-900 break-words line-clamp-3 hover:line-clamp-none transition-all duration-300"
                      />
                    </div>
                  </td>
                );
              })}
              {isEditMode && (
                <td className="px-4 py-3 text-right sticky right-0 bg-white/80 backdrop-blur-sm group-hover:bg-slate-50/80 transition-colors w-[50px]">
                  <button 
                    onClick={() => removeRow(i)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-500 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {isEditMode && (
        <button 
          onClick={addRow}
          className="w-full mt-2 py-2 border border-dashed border-slate-200 rounded-lg text-[10px] font-bold uppercase text-slate-400 hover:text-blue-500 hover:border-blue-500/50 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Add Row
        </button>
      )}
      </div>
    </div>
  );
};
