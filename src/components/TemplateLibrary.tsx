import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { WIDGET_TEMPLATES } from '../constants/templates';
import { X, Layout, Plus, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TemplateLibraryProps {
  onClose: () => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onClose }) => {
  const { addFromTemplate } = useDashboard();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  const categories = Array.from(new Set(WIDGET_TEMPLATES.map(t => t.category)));

  const filteredTemplates = WIDGET_TEMPLATES.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-4xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Layout size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase italic">Template Library</h2>
              <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">Select a pre-configured widget to add</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${!selectedCategory ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}
            >
              All
            </button>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredTemplates.map((template) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={template.id}
                  className="group bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all flex flex-col h-full relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Layout size={80} className="-rotate-12" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-widest">
                        {template.category}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[8px] font-black uppercase tracking-widest uppercase">
                        {template.config.type}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-slate-900 mb-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                      {template.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium mb-4 italic line-clamp-2">
                      {template.description}
                    </p>
                  </div>

                  <button 
                    onClick={() => {
                      addFromTemplate(template.id);
                      onClose();
                    }}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.1em] hover:bg-blue-600 transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-blue-500/20 active:scale-[0.98]"
                  >
                    <Plus size={14} /> Add to Dashboard
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {filteredTemplates.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
              <Search size={48} className="mb-4 opacity-20" />
              <p className="font-mono text-xs uppercase font-bold tracking-widest opacity-40">No templates found</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
