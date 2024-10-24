"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun, ArrowRight } from "lucide-react";

const InterviewScene = ({ theme }: { theme?: string }) => {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowText(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.svg
      width="300"
      height="200"
      viewBox="0 0 300 200"
      initial="hidden"
      animate="visible"
    >
      {/* Desk */}
      <motion.rect
        x="50"
        y="120"
        width="200"
        height="10"
        fill={theme === 'light' ? "#8B4513" : "#D2691E"}
        variants={{
          hidden: { scaleX: 0 },
          visible: { scaleX: 1, transition: { duration: 0.5 } },
        }}
      />
      
      {/* Interviewer */}
      <motion.circle
        cx="100"
        cy="90"
        r="30"
        fill={theme === 'light' ? "#4A5568" : "#A0AEC0"}
        variants={{
          hidden: { scale: 0 },
          visible: { scale: 1, transition: { delay: 0.3, duration: 0.3 } },
        }}
      />
      <motion.rect
        x="85"
        y="130"
        width="30"
        height="50"
        fill={theme === 'light' ? "#2D3748" : "#718096"}
        variants={{
          hidden: { scaleY: 0 },
          visible: { scaleY: 1, transition: { delay: 0.4, duration: 0.3 } },
        }}
      />

      {/* Interviewee (404) */}
      <motion.text
        x="165"
        y="100"
        fontSize="40"
        fontWeight="bold"
        fill={theme === 'light' ? "#FC8181" : "#FEB2B2"}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { delay: 0.6, duration: 0.5 } },
        }}
      >
        404
      </motion.text>
      <motion.rect
        x="185"
        y="130"
        width="30"
        height="50"
        fill={theme === 'light' ? "#FC8181" : "#FEB2B2"}
        variants={{
          hidden: { scaleY: 0 },
          visible: { scaleY: 1, transition: { delay: 0.7, duration: 0.3 } },
        }}
      />

      {/* Speech Bubble */}
      <AnimatePresence>
        {showText && (
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <path
              d="M 110 50 Q 120 30 140 40 L 180 40 Q 200 40 190 60 L 170 80 Q 160 90 140 80 L 120 70 Q 100 60 110 50"
              fill={theme === 'light' ? "#EDF2F7" : "#2D3748"}
              stroke={theme === 'light' ? "#4A5568" : "#A0AEC0"}
              strokeWidth="2"
            />
            <text
              x="115"
              y="55"
              fontSize="12"
              fill={theme === 'light' ? "#2D3748" : "#EDF2F7"}
            >
              Where&apos;s the
            </text>
            <text
              x="117"
              y="68"
              fontSize="12"
              fill={theme === 'light' ? "#2D3748" : "#EDF2F7"}
            >
              candidate?
            </text>
          </motion.g>
        )}
      </AnimatePresence>
    </motion.svg>
  );
};

export default function NotFound() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  if (!mounted) return null;

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-4 transition-colors duration-300 ${theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-gray-900 text-gray-100'}`}>
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="absolute top-4 right-4"
      >
        {theme === "light" ? (
          <Moon className="h-[1.2rem] w-[1.2rem]" />
        ) : (
          <Sun className="h-[1.2rem] w-[1.2rem]" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>

      <motion.h1
        className="text-4xl font-bold mb-8"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Oops! The Candidate Is Missing
      </motion.h1>

      <InterviewScene theme={theme} />

      <motion.p
        className="text-center mt-8 mb-8 max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        It looks like our job candidate (Page 404) didn&apos;t show up for the interview. Don&apos;t worry, we have plenty of other opportunities waiting for you!
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Link href="/" passHref>
          <Button className="group">
            Back to Job Fair
            <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </Button>
        </Link>
      </motion.div>

      <footer className="absolute bottom-8 text-center text-gray-500 text-sm">
        © 2024 Job Fair. All rights reserved.
      </footer>
    </div>
  );
}