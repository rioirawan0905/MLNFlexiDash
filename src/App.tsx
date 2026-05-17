/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { Header } from './components/Header';
import { WidgetWrapper } from './components/WidgetWrapper';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './lib/i18n';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

const DashboardContent: React.FC = () => {
  const { activeDashboard, isLoading, isEditMode, reorderWidgets, addWidget } = useDashboard();
  const { t } = useTranslation();
  const [showAddMenu, setShowAddMenu] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && over) {
      const oldIndex = activeDashboard?.widgets.findIndex(w => w.id === active.id) ?? -1;
      const newIndex = activeDashboard?.widgets.findIndex(w => w.id === over.id) ?? -1;
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderWidgets(oldIndex, newIndex);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-slate-900 dark:text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="uppercase tracking-[0.2em] font-bold opacity-30 text-xs">Loading Analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-900 dark:text-white">
      <Header />
      <main className="max-w-[1700px] mx-auto p-4 sm:p-6 lg:p-10">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={activeDashboard?.widgets.map(w => w.id) || []}
            strategy={rectSortingStrategy}
            disabled={!isEditMode}
          >
            <div className="dashboard-grid">
              {activeDashboard?.widgets.map((widget) => (
                <WidgetWrapper key={widget.id} config={widget} />
              ))}

              {isEditMode && (
                <div className="relative">
                  <button 
                    onClick={() => setShowAddMenu(!showAddMenu)}
                    className="widget-card min-h-[150px] w-full border-dashed border-2 border-white/10 flex flex-col items-center justify-center gap-3 opacity-30 hover:opacity-100 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-slate-400 hover:text-blue-400 group"
                  >
                    <Plus size={32} className={`group-hover:scale-110 transition-transform ${showAddMenu ? 'rotate-45 text-red-400' : ''}`} />
                    <span className="font-mono text-[10px] uppercase font-bold tracking-widest">{showAddMenu ? t('cancel') : t('add_widget')}</span>
                  </button>

                  {showAddMenu && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-2 grid grid-cols-2 gap-1 z-50 animate-in fade-in zoom-in-95">
                      {(['metric', 'chart', 'table', 'highlights', 'timeline', 'progress'] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => {
                            addWidget(type);
                            setShowAddMenu(false);
                          }}
                          className="px-3 py-2 text-[10px] font-bold uppercase rounded-lg hover:bg-blue-600 hover:text-white text-slate-400 transition-colors border border-white/5"
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </main>
      
      <footer className="mt-20 p-12 border-t border-slate-200 dark:border-white/5 opacity-40 dark:opacity-20">
        <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 font-mono text-[8px] uppercase font-bold tracking-widest">
          <div className="flex items-center gap-4 text-left">
            <span>&copy; 2026 FLEXIDASH SYSTEM</span>
            <span className="hidden md:inline">•</span>
            <span>{activeDashboard?.name}</span>
          </div>
          <div className="flex gap-8">
            <span>ROBUST DATA INTEGRATION</span>
            <span>MULTI-USER SYNC</span>
          </div>
          <div className="flex gap-4">
            <span>EU-WEST-1</span>
            <span>SECURE ISO-27001</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
