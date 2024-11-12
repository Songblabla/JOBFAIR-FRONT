'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DebugClear() {
  const router = useRouter();
  const [status, setStatus] = useState('Initializing cleanup...');
  const [progress, setProgress] = useState(0);
  const [details, setDetails] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const addDetail = (detail: string) => {
    setDetails(prev => [...prev, detail]);
  };

  const clearAllData = async () => {
    try {
      setProgress(10);
      setStatus('Clearing local storage...');
      
      const localStorageKeys = Object.keys(localStorage);
      localStorageKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      addDetail(`Cleared ${localStorageKeys.length} localStorage items`);
      setProgress(40);
      
      setStatus('Clearing session storage...');
      const sessionStorageKeys = Object.keys(sessionStorage);
      sessionStorageKeys.forEach(key => {
        sessionStorage.removeItem(key);
      });
      addDetail(`Cleared ${sessionStorageKeys.length} sessionStorage items`);
      setProgress(70);
      
      setStatus('Clearing cookies...');
      const cookies = document.cookie.split(";");
      cookies.forEach(cookie => {
        const cookieName = cookie.split("=")[0].trim();
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      });
      addDetail(`Cleared ${cookies.length} cookies`);
      
      localStorage.clear();
      sessionStorage.clear();
      
      setProgress(100);
      setStatus('Cleanup complete');
      setIsComplete(true);
      
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error) {
      setStatus('Error during cleanup');
      addDetail(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    clearAllData();
  });

  return (
    <div className="min-h-screen w-full bg-[#F5F5F7] dark:bg-[#1D1D1F] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-lg bg-white/80 dark:bg-black/80 backdrop-blur-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-medium tracking-tight">
            System Reset
          </CardTitle>
          <CardDescription className="text-base">
            Clearing system data and credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">{status}</span>
              <span className="text-neutral-600 dark:text-neutral-400">{progress}%</span>
            </div>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {details.map((detail, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center space-x-2"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {detail}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Bottom Status */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
            {isComplete ? (
              <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
                <span>Redirecting to login...</span>
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-neutral-600 dark:text-neutral-400" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}