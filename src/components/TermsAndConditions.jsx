import { motion } from 'framer-motion';
import { X, FileText } from 'lucide-react';

const TermsAndConditions = ({ onClose }) => {
  return (
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
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-palette-lavender/20 flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-palette-lavender via-palette-quartz to-palette-gold p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white">
              Términos y Condiciones
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4 text-palette-graphite">
            <section>
              <h3 className="text-lg font-display font-bold text-palette-graphite mb-2">
                1. Privacidad y Confidencialidad
              </h3>
              <p className="text-sm leading-relaxed">
                Todo el contenido dentro de esta aplicación es privado y confidencial. 
                Está estrictamente prohibido exponer, compartir, distribuir o hacer público 
                de manera libre cualquier dato, información, fotografía o contenido que los 
                usuarios publiquen dentro de la plataforma. El acceso a esta información 
                está restringido únicamente a los usuarios autorizados de la aplicación.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-display font-bold text-palette-graphite mb-2">
                2. Responsabilidad del Usuario
              </h3>
              <p className="text-sm leading-relaxed">
                Cada usuario es completamente responsable del contenido que sube, publica o 
                comparte dentro de la aplicación. El usuario garantiza que tiene todos los 
                derechos necesarios sobre el contenido que publica y se compromete a no 
                violar derechos de terceros, incluyendo pero no limitándose a derechos de 
                privacidad, imagen, propiedad intelectual o cualquier otro derecho legal.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-display font-bold text-palette-graphite mb-2">
                3. Naturaleza del Contenido - Supuesto y Ficticio
              </h3>
              <p className="text-sm leading-relaxed">
                <strong>IMPORTANTE:</strong> Todo el contenido publicado en esta aplicación 
                es de naturaleza supuesta, ficticia o fantástica. La información, datos, 
                fotografías, perfiles y cualquier otro contenido pueden no ser reales, 
                pueden ser producto de la imaginación, representaciones ficticias o 
                contenido de fantasía. No se garantiza la veracidad, autenticidad o 
                exactitud de ningún contenido publicado por los usuarios.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-display font-bold text-palette-graphite mb-2">
                4. Exención de Responsabilidad
              </h3>
              <p className="text-sm leading-relaxed">
                La aplicación y sus operadores no se hacen responsables de ningún contenido 
                subido, publicado o compartido por los usuarios. La aplicación actúa 
                únicamente como una plataforma de intercambio de información y no verifica, 
                valida, aprueba ni garantiza la veracidad, legalidad o exactitud del 
                contenido publicado por los usuarios. La aplicación no se responsabiliza 
                por daños, perjuicios, reclamaciones o consecuencias derivadas del uso del 
                contenido publicado por los usuarios.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-display font-bold text-palette-graphite mb-2">
                5. Reclamos y Controversias
              </h3>
              <p className="text-sm leading-relaxed">
                Cualquier reclamo, controversia, disputa o problema relacionado con el 
                contenido publicado dentro de la aplicación debe ser dirigido directamente 
                al usuario que subió, publicó o compartió dicho contenido. La aplicación 
                no interviene, media ni se responsabiliza por ningún tipo de reclamo entre 
                usuarios. Los usuarios son los únicos responsables de resolver cualquier 
                disputa relacionada con su contenido.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-display font-bold text-palette-graphite mb-2">
                6. Aceptación de los Términos
              </h3>
              <p className="text-sm leading-relaxed">
                Al aceptar estos términos y condiciones, el usuario reconoce que ha leído, 
                entendido y acepta todas las condiciones establecidas. El usuario acepta 
                que el contenido es supuesto o ficticio, que es responsable de su propio 
                contenido, y que la aplicación no se hace responsable de ningún aspecto 
                relacionado con el contenido publicado por los usuarios.
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-palette-lavender to-palette-quartz text-palette-graphite py-3 rounded-xl font-medium shadow-lg"
          >
            Entendido
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TermsAndConditions;

