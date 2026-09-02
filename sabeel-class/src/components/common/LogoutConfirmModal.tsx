import React from 'react';
import { LogOut, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../../utils/sound';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoggingOut?: boolean;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoggingOut = false
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-sky-100 dark:border-slate-800 text-center relative overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={() => {
              soundManager.playClickPop();
              onClose();
            }}
            className="absolute top-4 left-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Warning Icon Badge */}
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-900/60 shadow-xs">
            <LogOut className="w-7 h-7" />
          </div>

          <h3 className="text-base font-black text-slate-800 dark:text-slate-100 mb-1.5">
            تأكيد تسجيل الخروج
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6 px-2">
            هل أنت متأكد من رغبتك في تسجيل الخروج من منصة <strong dir="ltr" className="inline-block text-slate-700 dark:text-slate-200">Sabeel Class</strong>؟
            <br />
            يمكنك العودة في أي وقت بتسجيل الدخول بحساب Google.
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                soundManager.playClickPop();
                onClose();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="button"
              disabled={isLoggingOut}
              onClick={() => {
                soundManager.playClickPop();
                onConfirm();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-black shadow-md shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoggingOut ? 'جارٍ الخروج...' : 'تأكيد الخروج'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
