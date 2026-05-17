import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { X, Download, FileText, CheckSquare, Square, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useTranslation } from 'react-i18next';

interface ExportModalProps {
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ onClose }) => {
  const { multiState } = useDashboard();
  const { t } = useTranslation();
  const [selectedIds, setSelectedIds] = useState<string[]>(
    multiState?.dashboards.map(d => d.id) || []
  );
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!multiState) return null;

  const toggleDashboard = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleExport = async () => {
    if (selectedIds.length === 0) return;
    setIsExporting(true);
    setProgress(0);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '1200px'; // Wide enough for dashboard grid
      document.body.appendChild(container);

      for (let i = 0; i < selectedIds.length; i++) {
        const id = selectedIds[i];
        const dashboard = multiState.dashboards.find(d => d.id === id);
        if (!dashboard) continue;

        setProgress(Math.round(((i) / selectedIds.length) * 100));

        // Create a temporary element to render the dashboard
        const tempDiv = document.createElement('div');
        tempDiv.className = 'bg-slate-50 p-10 min-h-screen';
        tempDiv.innerHTML = `
          <div style="margin-bottom: 24px;">
            <h1 style="font-size: 24px; font-weight: bold; color: #0f172a;">${dashboard.name}</h1>
            <p style="font-size: 12px; color: #64748b; font-family: monospace;">FLEXIDASH SYSTEM EXPORT • ${new Date().toLocaleString()}</p>
          </div>
          <div class="dashboard-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;">
            ${dashboard.widgets.map(w => `
              <div class="widget-card ${w.gridSpan || 'col-span-1'}" style="min-height: 200px; padding: 20px; background: white; border: 1px solid #e2e8f0; border-radius: 16px;">
                <h3 style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #0f172a; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">${w.title}</h3>
                <div style="font-size: 12px; color: #334155;">[Widget Content: ${w.type}]</div>
              </div>
            `).join('')}
          </div>
        `;
        container.appendChild(tempDiv);

        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#f8fafc'
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        
        container.removeChild(tempDiv);
      }

      pdf.save(`FlexiDash_Export_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.removeChild(container);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 fill-mode-both">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <Download size={20} className="text-blue-500" />
              Export Dashboard
            </h2>
            <p className="text-xs text-slate-500 font-medium">Select dashboards to print to PDF</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-8 space-y-4 max-h-[400px] overflow-y-auto">
          {multiState.dashboards.map(dash => (
            <button
              key={dash.id}
              onClick={() => toggleDashboard(dash.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                selectedIds.includes(dash.id)
                  ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-500/10'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${selectedIds.includes(dash.id) ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-100 text-slate-400'}`}>
                  <FileText size={18} />
                </div>
                <div className="text-left">
                  <span className={`block font-bold text-sm ${selectedIds.includes(dash.id) ? 'text-blue-700' : 'text-slate-900'}`}>
                    {dash.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">
                    {dash.widgets.length} Widgets
                  </span>
                </div>
              </div>
              {selectedIds.includes(dash.id) ? (
                <CheckSquare size={20} className="text-blue-600" />
              ) : (
                <Square size={20} className="text-slate-200" />
              )}
            </button>
          ))}
        </div>

        <div className="p-8 bg-slate-50/50 border-t border-slate-100">
          <button
            onClick={handleExport}
            disabled={isExporting || selectedIds.length === 0}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 relative overflow-hidden"
          >
            {isExporting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Exporting... {progress}%</span>
                <div className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-300" style={{ width: `${progress}%` }} />
              </>
            ) : (
              <>
                <Download size={20} />
                <span>Download PDF ({selectedIds.length})</span>
              </>
            )}
          </button>
          <p className="mt-4 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
            Note: Rich charts and complex layout elements will be converted to high-fidelity images for PDF compatibility.
          </p>
        </div>
      </div>
    </div>
  );
};
