"use client"

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UserCircle, Menu, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from '../theme/mode';
import api from '@/lib/axios'; 

interface User {
  _id: string;
  name: string;
  email: string;
  tel: string;
  role: string;
}

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Companies', path: '/company' },
  { name: 'Bookings', path: '/booking' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) return null;

  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>("");

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setUser(null);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        setError('Failed to load user profile.');
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile.');
      setUser(null);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">Job Fair</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`transition-colors hover:text-foreground/80 ${
                  pathname === item.path ? 'text-foreground' : 'text-foreground/60'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <MobileNav />
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Optionally, add search functionality here */}
          </div>
          <nav className="flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <UserCircle className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[var(--radix-dropdown-trigger-width)]">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" passHref>
                <Button variant="ghost">Log in</Button>
              </Link>
            )}
            <div className='ml-2'>
              <ModeToggle />
            </div>
          </nav>
        </div>
      </div>
    </nav>
  );
}

function MobileNav() {
  const pathname = usePathname();
  return (
    <div className="flex flex-col space-y-3">
      {navItems.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          className={`transition-colors hover:text-foreground/80 ${
            pathname === item.path ? 'text-foreground' : 'text-foreground/60'
          }`}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
}