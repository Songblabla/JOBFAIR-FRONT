'use client';

import React, { createContext, useContext } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const MountedContext = createContext<boolean>(false);

export const useMounted = () => {
  return useContext(MountedContext);
};

interface LoaderProviderProps {
  children: React.ReactNode;
}

interface LoadingScreenProps {
  className?: string;
  message?: string;
}

export function LoaderProvider({ children }: LoaderProviderProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    localStorage.getItem('token');

    setMounted(true);
  }, []);

  return (
    <MountedContext.Provider value={mounted}>
      {mounted ? children : <LoadingScreen />}
    </MountedContext.Provider>
  );
}

export function LoadingScreen({
  className,
  message = 'Loading...'
}: LoadingScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'fixed inset-0 bg-background/80 backdrop-blur-sm',
        'flex flex-col items-center justify-center gap-4',
        className
      )}
    >
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent" />
          <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-muted opacity-30" />
        </motion.div>
      </div>
      <div className="animate-pulse text-sm text-muted-foreground">
        {message}
      </div>
    </motion.div>
  );
}

export function InlineLoading({
  className,
  size = 'md'
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('flex items-center justify-center', className)}
    >
      <div
        className={cn(
          'animate-spin rounded-full border-primary border-t-transparent',
          sizeClasses[size]
        )}
      />
    </motion.div>
  );
}

export function withMounted<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithMounted(props: P) {
    const mounted = useMounted();
    if (!mounted) {
      return <InlineLoading />;
    }
    return <Component {...props} />;
  };
}