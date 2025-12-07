import { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const DialogContext = createContext();

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

export const DialogProvider = ({ children }) => {
  const [dialog, setDialog] = useState(null);

  const showAlert = (message, title = 'Información', type = 'info') => {
    return new Promise((resolve) => {
      setDialog({
        type: 'alert',
        title,
        message,
        iconType: type,
        onClose: () => {
          setDialog(null);
          resolve();
        },
      });
    });
  };

  const showConfirm = (message, title = 'Confirmar') => {
    return new Promise((resolve) => {
      setDialog({
        type: 'confirm',
        title,
        message,
        onConfirm: () => {
          setDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setDialog(null);
          resolve(false);
        },
      });
    });
  };

  const value = {
    showAlert,
    showConfirm,
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'error':
        return AlertTriangle;
      case 'warning':
        return AlertTriangle;
      default:
        return Info;
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  const getHeaderColor = (type) => {
    switch (type) {
      case 'success':
        return 'from-green-500 to-green-600';
      case 'error':
        return 'from-red-500 to-red-600';
      case 'warning':
        return 'from-yellow-500 to-yellow-600';
      default:
        return 'from-palette-lavender via-palette-quartz to-palette-gold';
    }
  };

  return (
    <DialogContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {dialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[200]"
            onClick={() => {
              if (dialog.type === 'alert') {
                dialog.onClose();
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-palette-lavender/20"
            >
              {/* Header */}
              <div className={`bg-gradient-to-r ${getHeaderColor(dialog.iconType || 'info')} p-6 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    {(() => {
                      const Icon = getIcon(dialog.iconType || 'info');
                      return <Icon className={`w-6 h-6 text-white`} />;
                    })()}
                  </div>
                  <h2 className="text-2xl font-display font-bold text-white">
                    {dialog.title}
                  </h2>
                </div>
                {dialog.type === 'alert' && (
                  <motion.button
                    onClick={dialog.onClose}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-palette-graphite text-base leading-relaxed">
                  {dialog.message}
                </p>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-3">
                {dialog.type === 'confirm' ? (
                  <>
                    <motion.button
                      onClick={dialog.onCancel}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-palette-graphite rounded-xl font-medium transition"
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      onClick={dialog.onConfirm}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-palette-lavender to-palette-quartz text-palette-graphite rounded-xl font-medium shadow-lg"
                    >
                      Confirmar
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    onClick={dialog.onClose}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-palette-lavender to-palette-quartz text-palette-graphite rounded-xl font-medium shadow-lg"
                  >
                    Aceptar
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DialogContext.Provider>
  );
};

