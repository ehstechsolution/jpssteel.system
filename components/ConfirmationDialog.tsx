
import React from 'react';
import { X } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const CONFIRM_IMAGE = "https://i.ibb.co/352m4DwQ/Gemini-Generated-Image-u1ukg6u1ukg6u1uk.png";

  const colors = {
    danger: {
      button: 'bg-red-600 hover:bg-red-700 shadow-red-900/20'
    },
    warning: {
      button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/20'
    },
    info: {
      button: 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20'
    }
  };

  const activeColor = colors[variant];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 flex flex-col items-center text-center">
          {/* Imagem personalizada em substituição ao ícone */}
          <div className="w-24 h-24 mb-6 rounded-2xl overflow-hidden shadow-lg border-2 border-slate-50 ring-4 ring-slate-100/50">
            <img 
              src={CONFIRM_IMAGE} 
              alt="Confirmação JPS Steel" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            {message}
          </p>
          
          <div className="flex w-full space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all active:scale-95"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-3 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95 ${activeColor.button}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
