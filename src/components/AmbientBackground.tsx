import { motion } from "motion/react";

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 min-h-screen w-full overflow-hidden pointer-events-none z-[-1]">
      <div className="absolute inset-0 bg-[#050505] z-0" />
      
      {/* Soft animated gradient orb 1 */}
      <motion.div
        className="absolute top-[-100px] left-[-100px] w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(60,60,100,0.15) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(80px)"
        }}
        animate={{
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Soft animated gradient orb 2 */}
      <motion.div
        className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(60,60,100,0.15) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(80px)"
        }}
        animate={{
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}
