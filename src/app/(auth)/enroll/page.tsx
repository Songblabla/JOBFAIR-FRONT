"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useTheme } from "next-themes"
import { Moon, Sun, ArrowRight, Home } from "lucide-react"
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import api from '@/lib/axios';

const enrollSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  tel: z.string().regex(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/, 'Invalid phone number'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type EnrollFormData = z.infer<typeof enrollSchema>;

interface User {
  _id: string;
  name: string;
  email: string;
  tel: string;
  role: 'user' | 'admin';
}

interface EnrollProps {
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function EnrollPage({ setUser, setIsAdmin }: EnrollProps) {
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
  } = useForm<EnrollFormData>({
    resolver: zodResolver(enrollSchema)
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

  const onSubmit = async (data: EnrollFormData) => {
    setError('');
    try {
      const { confirmPassword, companyName, ...enrollData } = data;
      const combinedName = `${data.name}@${companyName}`;
      const submitData = { 
        ...enrollData,
        name: combinedName, 
        role: 'admin',
        createdAt: new Date().toISOString().split("T")[0] 
      };

      console.log("Sending Data:", submitData);

      const response = await api.post('/auth/register', submitData);
      const userData = response.data;

      console.log("userData", userData);
      localStorage.setItem('token', userData.token);

      router.push('/');

    } catch (error) {
      console.error('Enrollment failed:', error);
      setError('Enrollment failed. Please try again.');
    }
  };

  const handleHomeButton = () => {
    router.push("/");
  }

  if (!mounted) {
    return null
  }

  const gradientStyle = {
    backgroundImage: `linear-gradient(to bottom right, 
        hsl(${randomHue}, 60%, 94%), 
        hsl(${(randomHue + 30) % 360}, 55%, 96%), 
        hsl(${(randomHue + 60) % 360}, 50%, 95%))`
  }

  const darkGradientStyle = {
    backgroundImage: `linear-gradient(to bottom right, 
        hsl(${randomHue}, 50%, 30%), 
        hsl(${(randomHue + 30) % 360}, 45%, 35%), 
        hsl(${(randomHue + 60) % 360}, 40%, 40%))`
  }

  return (
    <div 
      className="min-h-screen text-gray-800 dark:text-gray-100 transition-colors duration-300"
      style={theme === 'light' ? gradientStyle : darkGradientStyle}
    >
      <div className="container mx-auto px-4 py-16 flex flex-col justify-between min-h-screen">
        <header className="text-center mb-16 relative">
          <div className="relative flex">
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

            <Button
              variant="outline"
              size="icon"
              onClick={handleHomeButton}
              className="absolute z-10"
            >
              <Home className='h-[1.2rem] w-[1.2rem]'/>
              <span className='sr-only'>Home</span>
            </Button>
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl font-bold mb-4"
          >
            Enroll Your Company
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl text-gray-600 dark:text-gray-200"
          >
            Join Job Fair as a Company Admin
          </motion.p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="max-w-md mx-auto w-full"
        >
          <Card className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-lg">
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
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Company Name"
                    {...register('companyName')}
                    className="w-full bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                  />
                  {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>}
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
                  className="w-full bg-zinc-600 hover:bg-zinc-700 text-white dark:bg-zinc-200 dark:hover:bg-zinc-400 dark:text-zinc-800 group"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enrolling...' : 'Enroll Company'}
                  <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                </Button>
              </form>
              <p className="text-center mt-4 text-gray-600 dark:text-gray-200">
                Already enrolled?{' '}
                <Link href="/login" className="text-zinc-600 dark:text-zinc-200 hover:underline font-semibold">
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