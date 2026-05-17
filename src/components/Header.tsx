import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboard } from '../context/DashboardContext';
import { Sun, Moon, Edit3, Save, X, Globe, Copy, Plus, ChevronDown, Trash2 } from 'lucide-react';
import { copyToClipboard } from '../lib/utils';
import { format } from 'date-fns';

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const { 
    multiState, 
    activeDashboard, 
    isEditMode, 
    toggleEditMode, 
    saveDashboard, 
    toggleTheme, 
    setLanguage,
    switchDashboard,
    addDashboard,
    deleteDashboard,
    updateDashboardName
  } = useDashboard();

  const [showDashSelector, setShowDashSelector] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-white/5 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 px-6 py-4 flex flex-wrap justify-between items-center gap-4 text-slate-900 dark:text-white">
      <div className="flex items-center gap-6">
        <div className="relative">
          <button 
            onClick={() => setShowDashSelector(!showDashSelector)}
            className="flex items-center gap-2 text-xl font-bold tracking-tight uppercase hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {isEditMode ? (
              <input 
                autoFocus
                value={activeDashboard?.name || ''}
                onChange={(e) => updateDashboardName(e.target.value)}
                className="bg-transparent border-b border-blue-500 outline-none w-[300px] text-slate-900 dark:text-white"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="text-slate-900 dark:text-white">{activeDashboard?.name || t('dashboard_title')}</span>
            )}
            <ChevronDown size={18} className={`transition-transform text-slate-400 dark:text-white ${showDashSelector ? 'rotate-180' : ''}`} />
          </button>

          {showDashSelector && (
            <div className="absolute top-full left-0 mt-2 w-[250px] bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1">
              <div className="p-2 space-y-1">
                {multiState?.dashboards.map(dash => (
                  <div key={dash.id} className="group flex items-center gap-2">
                    <button 
                      onClick={() => {
                        switchDashboard(dash.id);
                        setShowDashSelector(false);
                      }}
                      className={`flex-1 text-left px-3 py-2 rounded-lg text-xs font-bold uppercase transition-colors ${dash.id === activeDashboard?.id ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-slate-400'}`}
                    >
                      {dash.name}
                    </button>
                    {multiState.dashboards.length > 1 && (
                      <button 
                        onClick={() => deleteDashboard(dash.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
                {multiState && multiState.dashboards.length < 10 && (
                  <button 
                    onClick={() => {
                      addDashboard();
                      setShowDashSelector(false);
                    }}
                    className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-[10px] font-bold uppercase border border-dashed border-white/20 text-slate-500 hover:text-white hover:border-white/40 transition-all"
                  >
                    <Plus size={14} /> {t('add_dashboard', 'Add Dashboard')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="hidden lg:flex gap-2 text-[10px] font-mono opacity-60 dark:opacity-40 font-bold uppercase">
          <span>{format(new Date(), 'MMMM do, yyyy')}</span>
          <span>•</span>
          <button 
            onClick={() => copyToClipboard(window.location.href)}
            className="hover:text-primary-500 cursor-pointer flex items-center gap-1"
          >
            <Copy size={10} /> URL
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex border border-slate-200 dark:border-white/10 rounded-lg overflow-hidden bg-slate-100 dark:bg-white/5">
          <button 
            onClick={() => setLanguage('en')}
            className={`px-3 py-1.5 text-[10px] uppercase font-bold transition-colors ${multiState?.preferences.language === 'en' ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400'}`}
          >
            EN
          </button>
          <button 
            onClick={() => setLanguage('id')}
            className={`px-3 py-1.5 text-[10px] uppercase font-bold border-l border-slate-200 dark:border-white/10 transition-colors ${multiState?.preferences.language === 'id' ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400'}`}
          >
            ID
          </button>
        </div>

        <button 
          onClick={toggleTheme}
          className="p-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-white"
        >
          {multiState?.preferences.theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {isEditMode ? (
          <div className="flex gap-2">
            <button 
              onClick={toggleEditMode}
              className="px-4 py-2 text-xs font-bold border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all flex items-center gap-2 text-slate-600 dark:text-white"
            >
              <X size={16} /> {t('cancel')}
            </button>
            <button 
              onClick={saveDashboard}
              className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              <Save size={16} /> {t('save')}
            </button>
          </div>
        ) : (
          <button 
            onClick={toggleEditMode}
            className="px-4 py-2 text-xs font-bold bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-all flex items-center gap-2 text-slate-600 dark:text-white"
          >
            <Edit3 size={16} /> {t('edit_mode')}
          </button>
        )}
      </div>
    </header>
  );
};
