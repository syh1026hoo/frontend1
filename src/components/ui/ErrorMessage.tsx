import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorMessage({ 
  title = '오류가 발생했습니다', 
  message, 
  onRetry, 
  className 
}: ErrorMessageProps) {
  return (
    <div className={cn('text-center py-8', className)}>
      <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
