// types/alert.ts
export interface AlertFilter {
  contractId?: string;
  type?: string;
  severity?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  sortBy?: 'detectedAt' | 'severity' | 'riskFactor';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface AlertSummary {
  totalAlerts: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  resolvedCount: number;
  newAlertsToday: number;
}

export interface AlertResolutionData {
  alertId: string;
  status: 'resolved' | 'false-positive';
  resolveComment?: string;
  resolvedBy: string;
}

export interface AlertListResponse {
  alerts: AlertType[];
  total: number;
  page: number;
  size: number;
}

export interface AlertType {
  id: string;
  type: 'info' | 'warning' | 'error';
  severity: number; // 1-10
  title: string;
  description: string;
  timestamp: Date;
}