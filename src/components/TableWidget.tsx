import React from 'react';
import { WidgetConfig } from '../types';
import { useDashboard } from '../context/DashboardContext';
import { EditableValue } from './EditableValue';
import { Plus, Trash2 } from 'lucide-react';

interface TableWidgetProps {
  config: WidgetConfig;
}

export const TableWidget: React.FC<TableWidgetProps> = ({ config }) => {
  const { activeDashboard, isEditMode, updateData } = useDashboard();
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

  return (
    <div className="overflow-x-auto p-2">
      <table className="w-full text-left text-[11px] font-mono">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 italic">
            {data.columns.map((col: string, idx: number) => (
              <th key={idx} className="px-4 py-2 font-bold opacity-80 group/th">
                <div className="flex items-center gap-2">
                  <EditableValue 
                    value={col} 
                    dataKey={`${config.dataKey}.columns[${idx}]`}
                    onSave={(val) => renameColumn(col, String(val))}
                    className="text-[10px] font-bold text-slate-900 normal-case tracking-normal"
                  />
                  {isEditMode && data.columns.length > 1 && (
                    <button 
                      onClick={() => removeColumn(col)}
                      className="opacity-0 group-hover/th:opacity-100 p-1 text-red-500 hover:bg-red-500/10 rounded transition-all"
                    >
                      <Trash2 size={10} />
                    </button>
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
              {data.columns.map((col: string) => (
                <td key={col} className="px-4 py-3">
                  <EditableValue 
                    value={row[col]} 
                    dataKey={`${config.dataKey}.rows[${i}].${col}`} 
                    className="text-slate-900"
                  />
                </td>
              ))}
              {isEditMode && (
                <td className="px-4 py-3 text-right">
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
  );
};
