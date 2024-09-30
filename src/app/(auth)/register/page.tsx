"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useTheme } from "next-themes"
import { Moon, Sun, ArrowRight } from "lucide-react"
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import api from '@/lib/axios';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  tel: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  role: z.enum(['user', 'admin']).default('user'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface User {
  _id: string;
  name: string;
  email: string;
  tel: string;
  role: 'user' | 'admin';
}

interface RegisterProps {
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function RegisterPage({ setUser, setIsAdmin }: RegisterProps) {
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [randomHue, setRandomHue] = useState(0)

  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors, isSubmitting } 
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'user'
    }
  });

  const password = watch("password");

  useEffect(() => {
    setMounted(true)
    setRandomHue(Math.floor(Math.random() * 360))
  }, [])

  useEffect(() => {
    if (password && password.length > 0) {
      setShowConfirmPassword(true);
    } else {
      setShowConfirmPassword(false);
    }
  }, [password]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const onSubmit = async (data: RegisterFormData) => {
    setError('');
    try {
      const { confirmPassword, ...registerData } = data;
      const response = await api.post('/auth/register', registerData);
      const userData = response.data;
      
      localStorage.setItem('token', userData.token);
      setUser(userData.user);
      setIsAdmin(userData.user.role === 'admin');

      router.push('/');
    } catch (error) {
      console.error('Registration failed:', error);
      setError('Registration failed. Please try again.');
    }
  };

  if (!mounted) {
    return null
  }

  const gradientStyle = {
    backgroundImage: `linear-gradient(to bottom left, 
        hsl(${randomHue}, 60%, 92%), 
        hsl(${(randomHue + 30) % 360}, 55%, 94%), 
        hsl(${(randomHue + 60) % 360}, 50%, 93%))`
  }

  const darkGradientStyle = {
    backgroundImage: `linear-gradient(to bottom left, 
        hsl(${randomHue}, 50%, 35%), 
        hsl(${(randomHue + 30) % 360}, 45%, 40%), 
        hsl(${(randomHue + 60) % 360}, 40%, 45%))`
  }

  return (
    <div 
      className="min-h-screen text-gray-800 dark:text-gray-100 transition-colors duration-300"
      style={theme === 'light' ? gradientStyle : darkGradientStyle}
    >
      <div className="container mx-auto px-4 py-16 flex flex-col justify-between min-h-screen">
        <header className="text-center mb-16 relative">
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="absolute right-0 top-0 z-10"
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
            Join Job Fair
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl text-gray-600 dark:text-gray-200"
          >
            Create your account
          </motion.p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="max-w-md mx-auto w-full"
        >
          <Card className="bg-white dark:bg-zinc-900 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Full Name"
                    {...register('name')}
                    className="w-full bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    {...register('email')}
                    className="w-full bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <Input
                    type="tel"
                    placeholder="Phone Number"
                    {...register('tel')}
                    className="w-full bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                  />
                  {errors.tel && <p className="text-red-500 text-sm mt-1">{errors.tel.message}</p>}
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    {...register('password')}
                    className="w-full bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                </div>
                <AnimatePresence>
                  {showConfirmPassword && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Input
                        type="password"
                        placeholder="Confirm Password"
                        {...register('confirmPassword')}
                        className="w-full bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                      />
                      {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button 
                  type="submit" 
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white dark:bg-gray-200 dark:hover:bg-gray-300 dark:text-gray-800 group"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                </Button>
              </form>
              <p className="text-center mt-4 text-gray-600 dark:text-gray-300">
                Already have an account?{' '}
                <Link href="/login" className="text-gray-800 dark:text-gray-200 hover:underline font-semibold">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <footer className="text-center text-gray-600 dark:text-gray-200 text-sm mt-16">
          © 2024 Job Fair. All rights reserved.
        </footer>
      </div>
    </div>
  );
}