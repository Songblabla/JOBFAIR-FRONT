"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { User } from "@/types/user";

interface HomeProps {
  user: User | null;
}

export default function Home({ user }: HomeProps) {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="min-h-screen container mx-auto px-4 py-16 flex flex-col justify-between relative">
        <header className="text-center mb-16 relative">
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
            className="text-xl text-muted-foreground"
          >
            Connect with top companies. Find your dream job.
          </motion.p>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
        >
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">For Job Seekers</h2>
              <ul className="space-y-2 mb-6 text-muted-foreground">
                <li>• Browse companies from various industries</li>
                <li>• Schedule up to 3 interview sessions</li>
                <li>• Manage your bookings easily</li>
              </ul>
              {!user && (
                <Link href="/register" passHref>
                  <Button variant="outline" className="w-full group">
                    Sign Up Now
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Join as JobFair Admin</h2>
              <ul className="space-y-2 mb-6 text-muted-foreground">
                <li>• Create and manage job fairs</li>
                <li>• View and manage company registrations</li>
                <li>• Oversee the entire job fair process</li>
              </ul>
              <Link href="/enroll" passHref>
                <Button variant="outline" className="w-full group">
                  Join JobFair Admin
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-center"
          >
            <Link href="/companies" passHref>
              <Button size="lg" className="group">
                Browse Companies
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition" />
              </Button>
            </Link>
          </motion.div>
        )}

        <footer className="relative bottom-0 text-center text-muted-foreground text-sm">
          © 2024 Job Fair. All rights reserved.
        </footer>
      </div>
    </div>
  );
}