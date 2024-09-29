"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
  }
  
  interface LoginProps {
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>;
  }
  

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [randomHue, setRandomHue] = useState(0)

  useEffect(() => {
    setMounted(true)
    setRandomHue(Math.floor(Math.random() * 360))
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const handleSubmit = async (e: LoginProps) => {
    // e.preventDefault();
    // Handle login logic here
    console.log('Login attempt with:', email, password);
    // For now, just redirect to home page
    router.push('/');
  };

  if (!mounted) {
    return null
  }

    const gradientStyle = {
    backgroundImage: `linear-gradient(to bottom right, 
        hsl(${randomHue}, 60%, 90%), 
        hsl(${(randomHue + 30) % 360}, 55%, 92%), 
        hsl(${(randomHue + 60) % 360}, 50%, 91%))`
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
          <Card className="bg-white dark:bg-gray-900 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
                  />
                </div>
                <Button type="submit" className="w-full bg-gray-800 hover:bg-gray-900 text-white dark:bg-gray-200 dark:hover:bg-gray-300 dark:text-gray-800">
                  Sign In
                </Button>
              </form>
              <p className="text-center mt-4 text-gray-600 dark:text-gray-300">
                Don't have an account?{' '}
                <Link href="/register" className="text-gray-800 dark:text-gray-200 hover:underline font-semibold">
                  Sign up
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