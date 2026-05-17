export type WidgetType = 'metric' | 'chart' | 'table' | 'highlights' | 'progress' | 'timeline';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  gridSpan?: string; // e.g. "col-span-1"
  rowSpan?: string;  // e.g. "row-span-1"
  dataKey: string; 
  options?: any;
}

export interface DashboardData {
  [key: string]: any;
}

export interface DashboardState {
  id: string;
  name: string;
  widgets: WidgetConfig[];
  data: DashboardData;
}

export interface UserPreferences {
  activeDashboardId: string;
  theme: 'light' | 'dark';
  language: string;
}

export interface MultiDashboardState {
  dashboards: DashboardState[];
  preferences: UserPreferences;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
