import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

export default function StudentRegistrationFields({ visible, children }) {
  const reduceMotion = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div key="student-fields"
          initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
          animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
          exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
          transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}>
          <div className="space-y-3.5">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
