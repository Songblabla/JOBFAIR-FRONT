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

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface RegisterProps {
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [randomHue, setRandomHue] = useState(0)

  useEffect(() => {
    setMounted(true)
    setRandomHue(Math.floor(Math.random() * 360))
  }, [])

  useEffect(() => {
    if (password.length > 0) {
      setShowConfirmPassword(true);
    } else {
      setShowConfirmPassword(false);
      setConfirmPassword('');
    }
  }, [password]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    // Handle registration logic here
    console.log('Registration attempt with:', name, email, password);
    // For now, just redirect to home page
    router.push('/');
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
        hsl(${randomHue}, 50%, 87%), 
        hsl(${(randomHue + 30) % 360}, 45%, 89%), 
        hsl(${(randomHue + 60) % 360}, 40%, 88%))`
  }

  return (
    <div 
      className="min-h-screen text-gray-800 dark:text-gray-100 transition-colors duration-300"
      style={theme === 'light' ? gradientStyle : darkGradientStyle}
    >
      <div className="container mx-auto px-4 py-16 flex flex-col justify-between min-h-screen">
        <header className="text-center mb-16 relative">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="absolute right-0 top-0"
          >
            {theme === "light" ? (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
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
            className="text-xl text-gray-600 dark:text-gray-300"
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
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                  />
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
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <Button type="submit" className="w-full bg-gray-800 hover:bg-gray-900 text-white dark:bg-gray-200 dark:hover:bg-gray-300 dark:text-gray-800 group">
                  Create Account
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

        <footer className="text-center text-gray-600 dark:text-gray-400 text-sm mt-16">
          © 2024 Job Fair. All rights reserved.
        </footer>
      </div>
    </div>
  );
}