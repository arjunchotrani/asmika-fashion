"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export function SplashGate({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState<boolean | null>(null);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem("hasSeenAsmikaSplash");
    if (!hasSeenSplash) {
      setShowSplash(true);
      // Set to true after 4 seconds or when loading is done
      const timer = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem("hasSeenAsmikaSplash", "true");
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      setShowSplash(false);
    }
  }, []);

  if (showSplash === null) return null;

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-brand-black text-brand-ivory"
          >
            <div className="relative flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
              >
                <Image
                  src="/images/asmika-logo.png"
                  alt="Asmika Fashion"
                  width={0}
                  height={0}
                  sizes="(max-width: 768px) 280px, 420px"
                  className="w-[280px] md:w-[420px] h-auto object-contain"
                  priority
                />
              </motion.div>

              <div className="absolute -bottom-32 flex flex-col items-center">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "200px" }}
                  transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
                  className="h-[1px] bg-brand-gold/30 mb-4"
                />
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 2 }}
                  className="text-[10px] tracking-[0.3em] uppercase opacity-60"
                >
                  Powered by Ajanta Silk Mills
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 2.4 }}
                  className="text-[9px] tracking-[0.25em] uppercase opacity-40 mt-1"
                >
                  Since 1972
                </motion.p>
              </div>
            </div>

            {/* Subtle light effect */}
            <motion.div
              animate={{
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-radial-gradient from-brand-gold/5 to-transparent pointer-events-none"
            />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: showSplash ? 4.5 : 0 }}
      >
        {children}
      </motion.div>
    </>
  );
}
