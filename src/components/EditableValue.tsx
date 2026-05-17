import React, { useState, useEffect } from 'react';
import { Copy, Check, Edit2 } from 'lucide-react';
import { cn, copyToClipboard } from '../lib/utils';
import { useDashboard } from '../context/DashboardContext';

interface EditableValueProps {
  value: string | number;
  dataKey: string;
  className?: string;
  prefix?: string;
  suffix?: string;
  onSave?: (newValue: string | number) => void;
}

export const EditableValue: React.FC<EditableValueProps> = ({ value, dataKey, className, prefix, suffix, onSave }) => {
  const { isEditMode, updateData } = useDashboard();
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    copyToClipboard(`${prefix || ''}${value}${suffix || ''}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (onSave) {
      onSave(localValue);
    } else {
      updateData(dataKey, localValue);
    }
  };

  if (isEditMode && isEditing) {
    return (
      <input
        autoFocus
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
        className={cn("bg-slate-100 border-b border-blue-500 outline-none w-full px-1 rounded-t text-slate-900", className)}
      />
    );
  }

  return (
    <div 
      className={cn("group flex items-center gap-2 cursor-pointer text-slate-900", className)}
      onClick={() => isEditMode && setIsEditing(true)}
    >
      <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
        {prefix}{value}{suffix}
      </span>
      <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isEditMode ? (
          <Edit2 className="w-3 h-3 text-blue-500" />
        ) : (
          <button onClick={handleCopy} title="Copy to clipboard">
            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
          </button>
        )}
      </div>
    </div>
  );
};
