"use client";
import { motion } from "framer-motion";

export const BackgroundWave = () => {
  return (
    <motion.video
      src="/wave-loop.mp4"
      autoPlay
      muted
      loop
      controls={false}
      className="absolute inset-0 h-full w-full object-cover pointer-events-none opacity-75 grayscale"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.75 }}
      transition={{ duration: 1 }}
    />
  );
};
