import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, AlertCircle } from 'lucide-react';
import { downloadUpdate } from '../services/versionChecker';

const UpdateModal = ({ updateInfo, onClose }) => {
  if (!updateInfo) return null;

  const handleDownload = () => {
    if (updateInfo.downloadUrl) {
      downloadUpdate(updateInfo.downloadUrl);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-palette-lavender/20"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-palette-lavender via-palette-quartz to-palette-gold p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-display font-bold text-white">
                Actualización Disponible
              </h2>
            </div>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
            >
              <X className="w-5 h-5 text-white" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div>
              <p className="text-palette-graphite font-medium mb-2">
                Versión {updateInfo.version} (Build {updateInfo.build})
              </p>
              {updateInfo.updateMessage && (
                <p className="text-sm text-palette-graphite/70 mb-4">
                  {updateInfo.updateMessage}
                </p>
              )}
            </div>

            {updateInfo.changelog && updateInfo.changelog.length > 0 && (
              <div>
                <h3 className="text-sm font-display font-bold text-palette-graphite mb-2">
                  Cambios:
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-palette-graphite/70">
                  {updateInfo.changelog.map((change, index) => (
                    <li key={index}>{change}</li>
                  ))}
                </ul>
              </div>
            )}

            {updateInfo.releaseDate && (
              <p className="text-xs text-palette-graphite/50">
                Fecha de lanzamiento: {new Date(updateInfo.releaseDate).toLocaleDateString('es-ES')}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-3">
            {!updateInfo.updateRequired && (
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-palette-graphite rounded-xl font-medium transition"
              >
                Más tarde
              </motion.button>
            )}
            <motion.button
              onClick={handleDownload}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-palette-lavender to-palette-quartz text-palette-graphite rounded-xl font-medium shadow-lg flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Descargar Actualización
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpdateModal;

