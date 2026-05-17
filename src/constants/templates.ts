import { WidgetConfig } from '../types';

export interface WidgetTemplate {
  id: string;
  name: string;
  description: string;
  config: Omit<WidgetConfig, 'id' | 'dataKey'>;
  defaultData: any;
  category: string;
}

export const WIDGET_TEMPLATES: WidgetTemplate[] = [
  {
    id: 'tpl-revenue-metric',
    name: 'Revenue Metric',
    description: 'Displays current revenue with trend.',
    category: 'Finance',
    config: {
      type: 'metric',
      title: 'Total Revenue',
      gridSpan: 'col-span-1',
      options: { unit: '$' }
    },
    defaultData: { value: '128,450', label: 'Total Revenue', trend: '+12.5%' }
  },
  {
    id: 'tpl-growth-chart',
    name: 'User Growth',
    description: 'Bar chart showing monthly new users.',
    category: 'Analytics',
    config: {
      type: 'chart',
      title: 'Monthly Growth',
      gridSpan: 'col-span-2',
      options: { chartType: 'bar' }
    },
    defaultData: [
      { name: 'Jan', value: 400 },
      { name: 'Feb', value: 300 },
      { name: 'Mar', value: 600 },
      { name: 'Apr', value: 800 },
      { name: 'May', value: 1200 }
    ]
  },
  {
    id: 'tpl-project-status',
    name: 'Project Progress',
    description: 'Visual indicator of task completion.',
    category: 'Management',
    config: {
      type: 'progress',
      title: 'Sprint Completion',
      gridSpan: 'col-span-1'
    },
    defaultData: { percentage: 68, status: 'In Progress' }
  },
  {
    id: 'tpl-recent-orders',
    name: 'Recent Orders',
    description: 'List of the latest customer transactions.',
    category: 'Sales',
    config: {
      type: 'table',
      title: 'Latest Sales',
      gridSpan: 'col-span-2',
      options: {
        columns: ['Order ID', 'Customer', 'Amount', 'Status'],
        columnTypes: { 'Status': 'status' }
      }
    },
    defaultData: {
      columns: ['Order ID', 'Customer', 'Amount', 'Status'],
      rows: [
        { 'Order ID': '#1001', 'Customer': 'Alice Smith', 'Amount': '$250.00', 'Status': 'Success' },
        { 'Order ID': '#1002', 'Customer': 'Bob Johnson', 'Amount': '$120.00', 'Status': 'Pending' },
        { 'Order ID': '#1003', 'Customer': 'Charlie Brown', 'Amount': '$450.00', 'Status': 'Success' }
      ]
    }
  },
  {
    id: 'tpl-team-highlights',
    name: 'Team Achievements',
    description: 'Summary of key team wins.',
    category: 'Team',
    config: {
      type: 'highlights',
      title: 'Weekly Wins',
      gridSpan: 'col-span-1'
    },
    defaultData: [
      { category: 'Milestones', items: ['Backend migration complete', 'New CI/CD pipeline'] },
      { category: 'Customer', items: ['5 new testimonials', 'Resolved legacy tickets'] }
    ]
  },
  {
    id: 'tpl-product-roadmap',
    name: 'Product Roadmap',
    description: 'Gantt-style timeline for product milestones.',
    category: 'Product',
    config: {
      type: 'timeline',
      title: 'Q3 Roadmap',
      gridSpan: 'col-span-2'
    },
    defaultData: [
      { id: 't1', task: 'Market Research', start: '2026-06-01', end: '2026-06-15', isMilestone: false },
      { id: 't2', task: 'Design Assets', start: '2026-06-16', end: '2026-06-30', isMilestone: false },
      { id: 't3', task: 'MVP Launch', start: '2026-07-01', end: '2026-07-01', isMilestone: true }
    ]
  }
];
