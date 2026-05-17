import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DashboardState, WidgetConfig, DashboardData, MultiDashboardState, UserPreferences } from '../types';
import { api } from '../services/api';
import i18n from '../lib/i18n';
import { arrayMove } from '@dnd-kit/sortable';
import { addDays } from 'date-fns';

interface DashboardContextType {
  multiState: MultiDashboardState | null;
  activeDashboard: DashboardState | null;
  isLoading: boolean;
  isEditMode: boolean;
  toggleEditMode: () => void;
  updateData: (key: string, value: any) => void;
  updateWidget: (widgetId: string, config: Partial<WidgetConfig>) => void;
  deleteWidget: (widgetId: string) => void;
  reorderWidgets: (oldIndex: number, newIndex: number) => void;
  setLanguage: (lang: string) => void;
  toggleTheme: () => void;
  saveDashboard: () => Promise<void>;
  switchDashboard: (id: string) => void;
  addDashboard: () => void;
  deleteDashboard: (id: string) => void;
  updateDashboardName: (name: string) => void;
  addWidget: (type: WidgetType) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [multiState, setMultiState] = useState<MultiDashboardState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    api.getState().then(res => {
      if (res.success) {
        setMultiState(res.data);
        i18n.changeLanguage(res.data.preferences.language);
        if (res.data.preferences.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      setIsLoading(false);
    });
  }, []);

  const activeDashboard = multiState?.dashboards.find(d => d.id === multiState.preferences.activeDashboardId) || null;

  const toggleEditMode = () => setIsEditMode(prev => !prev);

  const updateActiveDashboard = (updater: (prev: DashboardState) => DashboardState) => {
    setMultiState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        dashboards: prev.dashboards.map(d => 
          d.id === prev.preferences.activeDashboardId ? updater(d) : d
        )
      };
    });
  };

  const updateData = (key: string, value: any) => {
    updateActiveDashboard(d => {
      // Handle nested updates for strings like "rows[0].Category"
      const newData = { ...d.data };
      const parts = key.split('.');
      let current = newData;
      
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        const arrayMatch = part.match(/(.+)\[(\d+)\]/);
        
        if (arrayMatch) {
          const [, name, indexStr] = arrayMatch;
          const index = parseInt(indexStr);
          current[name] = [...current[name]];
          current = current[name][index];
        } else {
          current[part] = { ...current[part] };
          current = current[part];
        }
      }
      
      const lastPart = parts[parts.length - 1];
      current[lastPart] = value;
      
      return { ...d, data: newData };
    });
  };

  const updateWidget = (widgetId: string, config: Partial<WidgetConfig>) => {
    updateActiveDashboard(d => ({
      ...d,
      widgets: d.widgets.map(w => w.id === widgetId ? { ...w, ...config } : w)
    }));
  };

  const deleteWidget = (widgetId: string) => {
    updateActiveDashboard(d => ({
      ...d,
      widgets: d.widgets.filter(w => w.id !== widgetId)
    }));
  };

  const reorderWidgets = (oldIndex: number, newIndex: number) => {
    updateActiveDashboard(d => ({
      ...d,
      widgets: arrayMove(d.widgets, oldIndex, newIndex)
    }));
  };

  const setLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setMultiState(prev => prev ? { 
      ...prev, 
      preferences: { ...prev.preferences, language: lang } 
    } : null);
  };

  const toggleTheme = () => {
    setMultiState(prev => {
      if (!prev) return null;
      const newTheme = prev.preferences.theme === 'light' ? 'dark' : 'light';
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { 
        ...prev, 
        preferences: { ...prev.preferences, theme: newTheme } 
      };
    });
  };

  const switchDashboard = (id: string) => {
    setMultiState(prev => prev ? {
      ...prev,
      preferences: { ...prev.preferences, activeDashboardId: id }
    } : null);
    setIsEditMode(false);
  };

  const addDashboard = () => {
    if (multiState && multiState.dashboards.length >= 10) return;
    
    const newId = `dash-${Date.now()}`;
    const newDash: DashboardState = {
      id: newId,
      name: `New Dashboard ${multiState?.dashboards.length || 0 + 1}`,
      widgets: [],
      data: {}
    };

    setMultiState(prev => prev ? {
      ...prev,
      dashboards: [...prev.dashboards, newDash],
      preferences: { ...prev.preferences, activeDashboardId: newId }
    } : null);
    setIsEditMode(true);
  };

  const deleteDashboard = (id: string) => {
    setMultiState(prev => {
      if (!prev || prev.dashboards.length <= 1) return prev;
      const newDashboards = prev.dashboards.filter(d => d.id !== id);
      const newActiveId = id === prev.preferences.activeDashboardId ? newDashboards[0].id : prev.preferences.activeDashboardId;
      return {
        ...prev,
        dashboards: newDashboards,
        preferences: { ...prev.preferences, activeDashboardId: newActiveId }
      };
    });
  };

  const updateDashboardName = (name: string) => {
    updateActiveDashboard(d => ({ ...d, name }));
  };

  const addWidget = (type: WidgetType) => {
    updateActiveDashboard(d => {
      const newId = `w-${Date.now()}`;
      const dataKey = `new_widget_${Date.now()}`;
      
      // Initialize some default data for the new widget
      const newData = { ...d.data };
      if (type === 'metric') newData[dataKey] = { value: '0.00', label: 'New Metric', trend: '+0%' };
      if (type === 'highlights') newData[dataKey] = [{ category: 'New Category', items: ['Feature 1'] }];
      if (type === 'table') newData[dataKey] = { columns: ['Header 1', 'Header 2'], rows: [{ 'Header 1': 'Data', 'Header 2': 'Data' }] };
      if (type === 'chart') newData[dataKey] = [{ name: 'A', value: 10 }, { name: 'B', value: 20 }];
      if (type === 'progress') newData[dataKey] = { percentage: 75, status: 'On Track' };
      if (type === 'timeline') newData[dataKey] = [
        { id: '1', task: 'Project Initiation', start: new Date().toISOString().split('T')[0], end: addDays(new Date(), 5).toISOString().split('T')[0], isMilestone: true },
        { id: '2', task: 'Design Phase', start: addDays(new Date(), 6).toISOString().split('T')[0], end: addDays(new Date(), 15).toISOString().split('T')[0], predecessor: '1' }
      ];

      return {
        ...d,
        widgets: [...d.widgets, { id: newId, type, title: 'New Widget', gridSpan: 'col-span-1', dataKey }],
        data: newData
      };
    });
  };

  const saveDashboard = async () => {
    if (multiState) {
      await api.saveState(multiState);
      setIsEditMode(false);
    }
  };

  return (
    <DashboardContext.Provider value={{
      multiState,
      activeDashboard,
      isLoading,
      isEditMode,
      toggleEditMode,
      updateData,
      updateWidget,
      deleteWidget,
      reorderWidgets,
      setLanguage,
      toggleTheme,
      saveDashboard,
      switchDashboard,
      addDashboard,
      deleteDashboard,
      updateDashboardName,
      addWidget
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used within DashboardProvider');
  return context;
};
