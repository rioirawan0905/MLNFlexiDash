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

  const toggleAll = () => {
    if (selectedIds.length === multiState.dashboards.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(multiState.dashboards.map(d => d.id));
    }
  };

  const toggleDashboard = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleExport = async () => {
    if (selectedIds.length === 0) return;
    setIsExporting(true);
    setProgress(0);

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.zIndex = '-1000';
    container.style.width = '1200px';
    container.style.pointerEvents = 'none';
    container.style.opacity = '0';
    container.style.backgroundColor = '#f8fafc';
    document.body.appendChild(container);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < selectedIds.length; i++) {
        const id = selectedIds[i];
        const dashboard = multiState.dashboards.find(d => d.id === id);
        if (!dashboard) continue;

        setProgress(Math.round(((i) / selectedIds.length) * 100));

        const pageDiv = document.createElement('div');
        pageDiv.style.padding = '60px';
        pageDiv.style.width = '1200px';
        pageDiv.style.backgroundColor = '#f8fafc';
        pageDiv.style.fontFamily = 'Inter, sans-serif';
        
        const headerHtml = `
          <div style="margin-bottom: 40px; border-bottom: 4px solid #1e293b; padding-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
              <h1 style="font-size: 42px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -1px;">${dashboard.name}</h1>
              <p style="font-size: 14px; font-weight: 700; color: #3b82f6; margin: 10px 0 0 0; text-transform: uppercase; letter-spacing: 2px;">Executive Operations Report</p>
            </div>
            <div style="text-align: right;">
              <p style="font-size: 10px; color: #64748b; margin: 0; font-family: monospace; font-weight: 800;">REF: FLX-${dashboard.id.slice(-4).toUpperCase()}</p>
              <p style="font-size: 10px; color: #64748b; margin: 0; font-family: monospace; font-weight: 800;">DATE: ${new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>
        `;

        const widgetsHtml = `
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;">
            ${dashboard.widgets.map(w => {
              let contentHtml = '';
              const widgetData = dashboard.data[w.dataKey];

              if (w.type === 'metric') {
                const val = w.data?.value || widgetData?.value || '0';
                const unit = w.data?.unit || widgetData?.unit || '';
                const label = w.data?.label || widgetData?.label || 'Metric';
                contentHtml = `
                  <div style="text-align: center; padding: 15px; width: 100%;">
                    <div style="font-size: 42px; font-weight: 900; color: #3b82f6; margin-bottom: 8px;">${val}<span style="font-size: 20px; vertical-align: middle; margin-left: 4px;">${unit}</span></div>
                    <div style="font-size: 11px; color: #64748b; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">${label}</div>
                  </div>
                `;
              } else if (w.type === 'progress') {
                const pct = Number(widgetData?.percentage) || 0;
                let color = '#3b82f6';
                if (pct <= 33) color = '#f43f5e';
                else if (pct <= 66) color = '#f59e0b';

                contentHtml = `
                  <div style="padding: 15px; width: 100%;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                        <span style="font-size: 11px; font-weight: 800; color: #1e293b; text-transform: uppercase;">${widgetData?.label || 'Progress'}</span>
                        <span style="font-size: 11px; font-weight: 900; color: ${color};">${pct}%</span>
                    </div>
                    <div style="height: 16px; background: #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
                      <div style="height: 100%; width: ${pct}%; background: ${color}; box-shadow: 0 0 10px ${color}44;"></div>
                    </div>
                  </div>
                `;
              } else if (w.type === 'chart') {
                const chartData = widgetData || [];
                const chartType = (w.options?.chartType || 'bar').toUpperCase();
                contentHtml = `
                  <div style="padding: 15px; width: 100%;">
                    <div style="font-size: 10px; color: #64748b; margin-bottom: 15px; font-weight: 800; text-align: center; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">${chartType} Analysis</div>
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        ${(Array.isArray(chartData) ? chartData.slice(0, 5) : []).map((item: any) => `
                            <div style="display: flex; justify-content: space-between; font-size: 10px; border-bottom: 1px solid #f1f5f9; padding: 4px 0;">
                                <span style="font-weight: 700; color: #475569;">${item.name}</span>
                                <span style="font-family: monospace; font-weight: 900; color: #3b82f6;">${item.value}</span>
                            </div>
                        `).join('')}
                    </div>
                  </div>
                `;
              } else if (w.type === 'table') {
                  const tableData = widgetData || [];
                  const options = w.options || {};
                  const columns = options.columns || (Array.isArray(tableData) && tableData.length > 0 ? Object.keys(tableData[0]) : []);
                  contentHtml = `
                    <div style="width: 100%; overflow: hidden; padding: 10px;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
                            <thead>
                                <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                                    ${(Array.isArray(columns) ? columns : []).map((c: string) => `<th style="text-align: left; padding: 8px 6px; text-transform: uppercase; font-weight: 800; color: #475569;">${c}</th>`).join('')}
                                </tr>
                            </thead>
                            <tbody>
                                ${(Array.isArray(tableData) ? tableData.slice(0, 4) : []).map((row: any) => `
                                    <tr>
                                        ${(Array.isArray(columns) ? columns : []).map((c: string) => `<td style="padding: 8px 6px; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${row[c]}</td>`).join('')}
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                  `;
              } else if (w.type === 'highlights') {
                  const highlights = Array.isArray(widgetData) ? widgetData : [];
                  contentHtml = `
                    <div style="width: 100%; padding: 10px;">
                        ${highlights.slice(0, 2).map((h: any) => `
                            <div style="margin-bottom: 12px;">
                                <div style="font-size: 9px; font-weight: 900; color: #3b82f6; text-transform: uppercase; margin-bottom: 4px;">${h.category}</div>
                                <div style="font-size: 9px; color: #475569; padding-left: 8px; border-left: 2px solid #e2e8f0;">
                                    ${h.items.slice(0, 2).map((item: string) => `<div style="margin-bottom: 2px;">• ${item}</div>`).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                  `;
              } else if (w.type === 'timeline') {
                  const timeline = Array.isArray(widgetData) ? widgetData : [];
                  contentHtml = `
                    <div style="width: 100%; padding: 10px;">
                        <div style="font-size: 9px; color: #64748b; margin-bottom: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Project Schedule</div>
                        ${timeline.slice(0, 4).map((t: any) => `
                            <div style="display: flex; gap: 8px; margin-bottom: 6px; align-items: center;">
                                <div style="width: 6px; h: 6px; border-radius: 50%; background: ${t.isMilestone ? '#f59e0b' : '#3b82f6'}; flex-shrink: 0;"></div>
                                <div style="flex: 1;">
                                    <div style="font-size: 9px; font-weight: 800; color: #1e293b;">${t.task}</div>
                                    <div style="font-size: 8px; color: #94a3b8; font-family: monospace;">${t.start} - ${t.end}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                  `;
              } else {
                contentHtml = `<div style="padding: 20px; color: #94a3b8; font-style: italic; font-size: 12px; text-align: center; border: 1px dashed #e2e8f0; border-radius: 8px;">${w.type.toUpperCase()} data summarized in report</div>`;
              }

              return `
                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 20px; padding: 20px; display: flex; flex-direction: column; break-inside: avoid; height: 220px; ${w.gridSpan === 'col-span-full' || w.gridSpan === 'col-span-4' ? 'grid-column: span 2;' : ''}">
                  <h3 style="font-size: 10px; font-weight: 900; text-transform: uppercase; color: #1e293b; margin-bottom: 15px; border-left: 3px solid #3b82f6; padding-left: 10px; display: inline-block; letter-spacing: 1px;">${w.title}</h3>
                  <div style="flex: 1; display: flex; align-items: center; justify-content: center; width: 100%; overflow: hidden;">${contentHtml}</div>
                </div>
              `;
            }).join('')}
          </div>
        `;

        const footerHtml = `
          <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; display: flex; justify-content: space-between; align-items: center;">
            <p style="font-size: 9px; color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">&copy; 2026 FlexiDash Analytics Engine</p>
            <p style="font-size: 9px; color: #94a3b8; font-weight: 800; text-transform: uppercase;">Page ${i + 1} of ${selectedIds.length}</p>
          </div>
        `;

        pageDiv.innerHTML = headerHtml + widgetsHtml + footerHtml;
        container.appendChild(pageDiv);

        const canvas = await html2canvas(pageDiv, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#f8fafc',
          logging: false,
          onclone: (clonedDoc) => {
            // html2canvas fails on modern CSS like oklch(). 
            // Since our PDF template uses standard hex colors, we can strip or replace these from the cloned head to prevent the parser from crashing.
            Array.from(clonedDoc.getElementsByTagName('style')).forEach(style => {
              if (style.innerHTML.includes('oklch')) {
                style.innerHTML = style.innerHTML.replace(/oklch\([^)]+\)/g, '#3b82f6');
              }
            });
          }
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.85); // Compress it a bit for size
        const canvasAspect = canvas.width / canvas.height;
        let finalWidth = pageWidth;
        let finalHeight = pageWidth / canvasAspect;

        if (finalHeight > pageHeight) {
          finalHeight = pageHeight;
          finalWidth = pageHeight * canvasAspect;
        }

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, finalWidth, finalHeight);
        
        container.removeChild(pageDiv);
      }

      pdf.save(`FlexiDash_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to generate PDF. Please check your dashboard data.');
    } finally {
      document.body.removeChild(container);
      setIsExporting(false);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <Download size={24} className="text-blue-600" />
              Report Center
            </h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Select dashboards to export to PDF</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <div className="p-10 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Dashboard Inventory</h3>
            <button 
              onClick={toggleAll}
              className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 underline underline-offset-4"
            >
              {selectedIds.length === multiState.dashboards.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="grid gap-3">
            {multiState.dashboards.map(dash => (
              <button
                key={dash.id}
                onClick={() => toggleDashboard(dash.id)}
                className={`w-full flex items-center justify-between p-5 rounded-3xl border transition-all ${
                  selectedIds.includes(dash.id)
                    ? 'border-blue-500 bg-blue-50/50 ring-4 ring-blue-500/5'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${selectedIds.includes(dash.id) ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-slate-100 text-slate-400'}`}>
                    <FileText size={20} />
                  </div>
                  <div className="text-left">
                    <span className={`block font-black text-base ${selectedIds.includes(dash.id) ? 'text-blue-700' : 'text-slate-900'}`}>
                      {dash.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-black uppercase tracking-widest mt-1 block">
                      {dash.widgets.length} Components
                    </span>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${selectedIds.includes(dash.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-200'}`}>
                  {selectedIds.includes(dash.id) && <CheckSquare size={14} className="text-white" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-10 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-5 border border-slate-200 hover:bg-slate-200 text-slate-600 rounded-[24px] font-black uppercase tracking-widest text-sm transition-all"
          >
            Close
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || selectedIds.length === 0}
            className="flex-[2] py-5 bg-slate-900 hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-[24px] font-black uppercase tracking-widest text-sm transition-all shadow-2xl shadow-slate-900/40 flex items-center justify-center gap-3 relative overflow-hidden"
          >
            {isExporting ? (
              <>
                <Loader2 size={18} className="animate-spin text-blue-400" />
                <span>Processing... {progress}%</span>
                <div className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
              </>
            ) : (
              <>
                <Download size={18} />
                <span>Generate PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
