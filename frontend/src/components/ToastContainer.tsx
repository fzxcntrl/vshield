import { useToastStore } from '../store/toastStore';
import { X, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        let bgColor = 'bg-white';
        let textColor = 'text-gray-800';
        let icon = null;

        if (toast.type === 'success') {
          bgColor = 'bg-green-50 border-green-200';
          textColor = 'text-green-800';
          icon = <CheckCircle2 className="w-5 h-5 text-green-500" />;
        } else if (toast.type === 'error') {
          bgColor = 'bg-red-50 border-red-200';
          textColor = 'text-red-800';
          icon = <AlertCircle className="w-5 h-5 text-red-500" />;
        } else if (toast.type === 'warning') {
          bgColor = 'bg-yellow-50 border-yellow-200';
          textColor = 'text-yellow-800';
          icon = <AlertTriangle className="w-5 h-5 text-yellow-500" />;
        }

        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${bgColor} pointer-events-auto animate-fade-in min-w-[300px]`}
          >
            {icon}
            <span className={`text-sm font-medium flex-1 ${textColor}`}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className={`${textColor} opacity-60 hover:opacity-100 transition-opacity`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
