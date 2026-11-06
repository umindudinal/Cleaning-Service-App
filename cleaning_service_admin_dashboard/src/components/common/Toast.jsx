import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Toast({ message }) {
  if (!message || !message.text) return null;

  const isError = message.type === 'error';

  return (
    <div
      className={`mx-8 mt-4 p-4 rounded-xl flex items-center space-x-3 text-sm font-medium transition-all ${
        isError
          ? 'bg-red-50 text-red-700 border border-red-200'
          : 'bg-green-50 text-green-700 border border-green-200'
      }`}
    >
      {isError ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
      <span>{message.text}</span>
    </div>
  );
}

