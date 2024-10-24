'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const PUBLIC_PATHS = ['/', '/login', '/register', '/enroll'];
const DEFAULT_PROTECTED_PATH = "/company";
const DEFAULT_PUBLIC_PATH = "/login";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const handleNavigation = (path: string) => {
      if (pathname !== path) {
        router.push(path);
      } else {
        setLoading(false);
      }
    };

    const token = localStorage.getItem('token');

    if (PUBLIC_PATHS.includes(pathname)) {
      if (token) {
        handleNavigation(DEFAULT_PROTECTED_PATH);
      } else {
        setLoading(false);
      }
      return;
    }

    if (!token) {
      handleNavigation(DEFAULT_PUBLIC_PATH);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = Date.now() >= payload.exp * 1000;

      if (isExpired) {
        localStorage.removeItem('token');
        handleNavigation(DEFAULT_PUBLIC_PATH);
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error('Error parsing token:', error);
      localStorage.removeItem('token');
      handleNavigation(DEFAULT_PUBLIC_PATH);
    }
  }, [router, pathname]);

  return isLoading ? null : children;
}
