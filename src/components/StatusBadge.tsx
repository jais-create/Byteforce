import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PackageCheck,
  Truck,
  XCircle,
} from 'lucide-react';
import {
  AlertSeverity,
  POStatus,
  RecommendationPriority,
  RecommendationStatus,
  StockStatus,
} from '../types/inventory';

export const StockStatusLabel: React.FC<{ status: StockStatus }> = ({ status }) => {
  switch (status) {
    case 'Out of Stock':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 whitespace-nowrap">
          <XCircle className="h-3.5 w-3.5 shrink-0" />
          Out of Stock
        </span>
      );
    case 'Critical':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 whitespace-nowrap">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          Critical
        </span>
      );
    case 'Low Stock':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 whitespace-nowrap">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Low Stock
        </span>
      );
    case 'Excess':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 whitespace-nowrap">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Excess
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 whitespace-nowrap">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          Healthy
        </span>
      );
  }
};

export const PriorityLabel: React.FC<{ priority: RecommendationPriority }> = ({ priority }) => {
  const styles: Record<RecommendationPriority, string> = {
    Critical: 'border-red-200 bg-red-50 text-red-700',
    High: 'border-amber-200 bg-amber-50 text-amber-800',
    Medium: 'border-blue-200 bg-blue-50 text-blue-700',
    Low: 'border-slate-200 bg-slate-50 text-slate-700',
  };
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${styles[priority]}`}
    >
      {priority}
    </span>
  );
};

export const RecStatusLabel: React.FC<{ status: RecommendationStatus }> = ({ status }) => {
  const styles: Record<RecommendationStatus, string> = {
    Pending: 'border-slate-200 bg-slate-100 text-slate-700',
    Approved: 'border-teal-200 bg-teal-50 text-teal-700',
    Ordered: 'border-blue-200 bg-blue-50 text-blue-700',
    Rejected: 'border-slate-200 bg-white text-slate-500',
  };
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${styles[status]}`}
    >
      {status}
    </span>
  );
};

export const POStatusLabel: React.FC<{ status: POStatus }> = ({ status }) => {
  switch (status) {
    case 'Pending':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 whitespace-nowrap">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          Pending
        </span>
      );
    case 'Approved':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 whitespace-nowrap">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          Approved
        </span>
      );
    case 'Shipped':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 whitespace-nowrap">
          <Truck className="h-3.5 w-3.5 shrink-0" />
          Shipped
        </span>
      );
    case 'Delivered':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 whitespace-nowrap">
          <PackageCheck className="h-3.5 w-3.5 shrink-0" />
          Delivered
        </span>
      );
    case 'Cancelled':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 whitespace-nowrap">
          <XCircle className="h-3.5 w-3.5 shrink-0" />
          Cancelled
        </span>
      );
  }
};

export const SeverityLabel: React.FC<{ severity: AlertSeverity }> = ({ severity }) => {
  const styles: Record<AlertSeverity, string> = {
    Critical: 'border-red-200 bg-red-50 text-red-700',
    Warning: 'border-amber-200 bg-amber-50 text-amber-800',
    Info: 'border-blue-200 bg-blue-50 text-blue-700',
  };
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${styles[severity]}`}
    >
      {severity}
    </span>
  );
};
