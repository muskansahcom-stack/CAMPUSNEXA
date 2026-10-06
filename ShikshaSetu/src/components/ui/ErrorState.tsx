import React from 'react';
import { Button } from './Button';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  isNetworkError?: boolean;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something unexpected occurred',
  message = 'We could not fetch the latest learning data. Your local offline progress remains completely safe.',
  isNetworkError = false,
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-red-200 bg-red-50/40">
      <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
        {isNetworkError ? <WifiOff className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-900">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-600 max-w-md mt-1 mb-5 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
