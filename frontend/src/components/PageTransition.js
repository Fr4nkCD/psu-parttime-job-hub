import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

function PageTransition({ children }) {
  const { pathname } = useLocation();

  return (
    <motion.div
      key={pathname} // The key lives HERE now, not in App.js
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;