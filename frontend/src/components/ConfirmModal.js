import React from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import Logo from './Logo';
import { AlertTriangle, CheckCircle, XCircle, Info, Loader2 } from 'lucide-react';

/**
 * Confirmation Modal with Joboost logo
 * @param {boolean} open - Modal visibility
 * @param {function} onOpenChange - Toggle modal
 * @param {string} title - Modal title
 * @param {string} message - Modal message
 * @param {'confirm' | 'success' | 'error' | 'warning' | 'info'} type - Modal type
 * @param {function} onConfirm - Confirm action
 * @param {function} onCancel - Cancel action
 * @param {string} confirmText - Confirm button text
 * @param {string} cancelText - Cancel button text
 * @param {boolean} loading - Show loading state
 */
const ConfirmModal = ({
  open,
  onOpenChange,
  title = 'Confirmation',
  message = 'Êtes-vous sûr de vouloir continuer ?',
  type = 'confirm',
  onConfirm,
  onCancel,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  loading = false,
  showLogo = true,
}) => {
  const iconMap = {
    confirm: <AlertTriangle className="w-8 h-8 text-amber-500" />,
    success: <CheckCircle className="w-8 h-8 text-emerald-500" />,
    error: <XCircle className="w-8 h-8 text-red-500" />,
    warning: <AlertTriangle className="w-8 h-8 text-amber-500" />,
    info: <Info className="w-8 h-8 text-sky-500" />,
  };

  const colorMap = {
    confirm: 'btn-primary',
    success: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    error: 'bg-red-500 hover:bg-red-600 text-white',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white',
    info: 'btn-sky',
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          {showLogo && (
            <div className="flex justify-center mb-4 pb-4 border-b border-slate-100">
              <Logo size="sm" />
            </div>
          )}
          
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              {iconMap[type]}
            </div>
            <DialogTitle className="font-heading text-xl text-slate-900">
              {title}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-4 text-center">
          <p className="text-slate-600">{message}</p>
        </div>

        <DialogFooter className="flex gap-3 sm:justify-center">
          {type !== 'success' && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              data-testid="modal-cancel-btn"
            >
              {cancelText}
            </Button>
          )}
          <Button
            className={colorMap[type]}
            onClick={handleConfirm}
            disabled={loading}
            data-testid="modal-confirm-btn"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Chargement...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmModal;
