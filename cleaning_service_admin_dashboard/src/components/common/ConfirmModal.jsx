import { useEffect } from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Confirmation',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDanger = true,
  isLoading = false,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      onClick={() => {
        if (!isLoading) onClose();
      }}
    >
      <div
        className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-gray-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 rounded-md transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
            isDanger ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
          }`}
        >
          {isDanger ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
        </div>

        <h3 className="text-base font-semibold text-gray-900 leading-snug">{title}</h3>
        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{message}</p>

        <div className="flex items-center justify-end space-x-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium text-xs hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-white font-medium text-xs transition cursor-pointer disabled:opacity-50 ${
              isDanger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
