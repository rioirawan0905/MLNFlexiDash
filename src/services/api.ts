import { DashboardState, MultiDashboardState, ApiResponse } from '../types';

const STORAGE_KEY = 'flexi_dash_multi_state';

const initialDashboard: DashboardState = {
  id: 'mln-field-001',
  name: 'MLN Field Operation',
  widgets: [
    { id: 'w1', type: 'metric', title: 'Total WO', dataKey: 'total_wo', gridSpan: 'col-span-1' },
    { id: 'w2', type: 'metric', title: 'Est. POB', dataKey: 'est_pob', gridSpan: 'col-span-1' },
    { id: 'w3', type: 'metric', title: 'SD Duration', dataKey: 'sd_duration', gridSpan: 'col-span-1' },
    { id: 'w4', type: 'metric', title: '% Overall Status', dataKey: 'overall_status', gridSpan: 'col-span-1' },
    { id: 'w5', type: 'chart', title: 'PROCUREMENT STATUS', dataKey: 'procurement_stats', gridSpan: 'col-span-2', options: { chartType: 'pie' } },
    { id: 'w6', type: 'chart', title: 'SCOPE OF WORK', dataKey: 'scope_of_work', gridSpan: 'col-span-2' },
    { id: 'w7', type: 'table', title: 'FINANCIAL (as of April)', dataKey: 'financials', gridSpan: 'col-span-2' },
    { id: 'w8', type: 'highlights', title: 'FIELD OPERATION HIGHLIGHTS', dataKey: 'field_highlights', gridSpan: 'col-span-2' },
  ],
  data: {
    total_wo: { value: 729736, trend: '+736', label: 'Work Orders' },
    est_pob: { value: 1050, label: 'Personnel On Board' },
    sd_duration: { value: 21, trend: '35', label: 'Shut Down Days' },
    overall_status: { value: 28, trend: '35', label: 'Percent Completion' },
    financials: {
      columns: ['Category', 'Total', 'YTD', 'Remaining'],
      rows: [
        { Category: 'OPEX', Total: '78.73', YTD: '21.10', Remaining: '57.62' },
        { Category: 'CAPEX', Total: '84.75', YTD: '2.96', Remaining: '81.79' },
      ]
    },
    field_highlights: [
      { category: 'Well Service', items: ['MLN-16 GI assist perforation completed', 'MLNW-06 GI fill clean out ongoing'] },
      { category: 'Engineering', items: ['MLNW-3 pipeline fabrication started (30th May)', 'TAR Preparation rescheduled to Sep 2027'] },
    ],
    procurement_stats: [
      { name: 'Available', value: 13, color: '#fbbf24' },
      { name: 'Ordered', value: 42, color: '#3b82f6' },
      { name: 'Remaining', value: 45, color: '#ef4444' },
    ],
    scope_of_work: [
      { name: 'Vessel', value: 118 },
      { name: 'Filter', value: 31 },
      { name: 'Tank', value: 64 },
      { name: 'PSV', value: 178 },
      { name: 'Valve', value: 79 },
    ]
  }
};

const initialMultiState: MultiDashboardState = {
  dashboards: [initialDashboard],
  preferences: {
    activeDashboardId: 'mln-field-001',
    theme: 'dark',
    language: 'en'
  }
};

export const api = {
  getState: async (): Promise<ApiResponse<MultiDashboardState>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const stored = localStorage.getItem(STORAGE_KEY);
    return {
      success: true,
      data: stored ? JSON.parse(stored) : initialMultiState,
    };
  },

  saveState: async (state: MultiDashboardState): Promise<ApiResponse<MultiDashboardState>> => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      data: state,
    };
  }
};
