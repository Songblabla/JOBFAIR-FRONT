"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useTheme } from "next-themes"
import { Moon, Sun, ArrowRight, Home } from "lucide-react"
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import api from '@/lib/axios';
import Footer from '@/components/footer/footer';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const gradientStyle = useMemo(() => {
    const hue1 = Math.floor(Math.random() * 360);
    const hue2 = (hue1 + 30) % 360;
    const hue3 = (hue1 + 60) % 360;
    return {
      light: `linear-gradient(to bottom right, hsl(${hue1}, 60%, 90%), hsl(${hue2}, 55%, 92%), hsl(${hue3}, 50%, 91%))`,
      dark: `linear-gradient(to bottom left, hsl(${hue1}, 50%, 35%), hsl(${hue2}, 45%, 40%), hsl(${hue3}, 40%, 45%))`,
    };
  }, []);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    try {
      const response = await api.post('/auth/login', data);
      if (response.status === 200) {
        const userData = response.data;
        localStorage.setItem('token', userData.token);
        router.push('/');
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Invalid email or password. Please try again.');
    }
  };

  if (!mounted) return null;

  const backgroundStyle = theme 
    ? { backgroundImage: theme === 'dark' ? gradientStyle.dark : gradientStyle.light }
    : { backgroundColor: 'white' };

  return (
    <div 
      className="min-h-screen text-gray-800 dark:text-gray-100 transition-colors duration-300"
      style={backgroundStyle}
    >
      <div className="container mx-auto px-4 py-16 flex flex-col justify-between min-h-screen">
        <header className="text-center mb-16 relative">
          <div className="relative flex justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/")}
              className="z-10"
            >
              <Home className='h-[1.2rem] w-[1.2rem]'/>
              <span className='sr-only'>Home</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="z-10"
            >
              {theme === "light" ? (
                <Moon className="h-[1.2rem] w-[1.2rem]" />
              ) : (
                <Sun className="h-[1.2rem] w-[1.2rem]" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl font-bold mb-4"
          >
            Job Fair
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl text-gray-600 dark:text-gray-100"
          >
            Sign in to your account
          </motion.p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="max-w-md mx-auto w-full"
        >
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {['email', 'password'].map((field) => (
                  <div key={field}>
                    <Input
                      type={field === 'password' ? 'password' : 'text'}
                      placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                      {...register(field as keyof LoginFormData)}
                      className="w-full bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600"
                    />
                    {errors[field as keyof LoginFormData] && (
                      <p className="text-red-500 text-sm mt-1">{errors[field as keyof LoginFormData]?.message}</p>
                    )}
                  </div>
                ))}
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button 
                  type="submit" 
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white dark:bg-gray-200 dark:hover:bg-gray-300 dark:text-gray-800 group"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                  <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                </Button>
              </form>
              <p className="text-center mt-4 text-gray-600 dark:text-gray-300">
                Don't have an account?<span> </span>
                <Link href="/register" className="text-gray-800 dark:text-gray-200 hover:underline font-semibold">
                  Sign up
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <Footer />
      </div>
    </div>
  );
}