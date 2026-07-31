import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useOutlet } from "react-router";

/**
 * Drop-in replacement for react-router's <Outlet/>: crossfades + slides
 * between routed pages instead of an instant swap. Sidebar/header live
 * outside this (mounted once in App.tsx) and are never touched - only the
 * content area animates. `mode="wait"` so the outgoing page fully exits
 * before the incoming one enters, avoiding overlap/layout jumps.
 */
const AnimatedOutlet = () => {
  const location = useLocation();
  const element = useOutlet();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18, ease: "easeInOut" }}
      >
        {element}
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimatedOutlet;
