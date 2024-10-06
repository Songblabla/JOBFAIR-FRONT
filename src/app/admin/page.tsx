"use client"

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createSwapy } from 'swapy';
import { Settings, GripVertical, GripHorizontal, Building, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '@/lib/axios';

const AdminDashboard = () => {
  const [layout, setLayout] = useState({
    '1': { component: 'companies', width: 400, height: 400 },
    '2': { component: 'bookings', width: 400, height: 400 },
    '3': { component: 'me', width: 400, height: 400 },
    '4': { component: null, width: 400, height: 400 }
  });
  const [companies, setCompanies] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const dashboardRef = useRef(null);

  const fetchData = useCallback(async (endpoint, setter) => {
    try {
      const response = await api.get(endpoint);
      setter(response.data.data);
    } catch (error) {
      console.error(`Error fetching data from ${endpoint}:`, error);
      setError(`Failed to fetch data from ${endpoint}. Please try again.`);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    await Promise.all([
      fetchData('/companies', setCompanies),
      fetchData('/bookings', setBookings),
      fetchData('/auth/me', setCurrentUser)
    ]);
  }, [fetchData]);

  useEffect(() => {
    fetchAllData();

    const swapy = createSwapy(dashboardRef.current, {
      swapMode: 'swap',
      animation: 'ease'
    });

    swapy.onSwap(({ data }) => {
      setLayout(prevLayout => {
        const newLayout = { ...prevLayout };
        Object.keys(data.object).forEach(key => {
          newLayout[key].component = data.object[key];
        });
        return newLayout;
      });
    });

    return () => {
      swapy.destroy();
    };
  }, [fetchAllData]);

  const handleResize = (id, direction, delta) => {
    setLayout(prevLayout => {
      const newLayout = { ...prevLayout };
      if (direction === 'horizontal') {
        newLayout[id].width = Math.max(200, newLayout[id].width + delta);
      } else if (direction === 'vertical') {
        newLayout[id].height = Math.max(200, newLayout[id].height + delta);
      }
      return newLayout;
    });
  };

  const CardWrapper = ({ id, children }) => {
    const { width, height } = layout[id];
    return (
      <div style={{ width, height }} className="relative">
        <Card className="h-full">
          {children}
          <div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 cursor-ns-resize p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
            onMouseDown={(e) => {
              e.preventDefault();
              const startY = e.pageY;
              const startHeight = height;
              const handleMouseMove = (moveEvent) => {
                const delta = moveEvent.pageY - startY;
                handleResize(id, 'vertical', delta);
              };
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          >
            <GripHorizontal className="h-4 w-4" />
          </div>
          <div
            className="absolute top-1/2 right-0 transform -translate-y-1/2 cursor-ew-resize p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
            onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.pageX;
              const startWidth = width;
              const handleMouseMove = (moveEvent) => {
                const delta = moveEvent.pageX - startX;
                handleResize(id, 'horizontal', delta);
              };
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          >
            <GripVertical className="h-4 w-4" />
          </div>
        </Card>
      </div>
    );
  };

  const CompaniesCard = ({ id }) => (
    <CardWrapper id={id}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Companies</CardTitle>
        <Settings className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{companies.length}</div>
        <p className="text-xs text-muted-foreground">Total registered companies</p>
        <div className="h-[200px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={companies.map(company => ({ name: company.name, value: company.business.length }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </CardWrapper>
  );

  const BookingsCard = ({ id }) => (
    <CardWrapper id={id}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Bookings</CardTitle>
        <Settings className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{bookings.length}</div>
        <p className="text-xs text-muted-foreground">Total bookings</p>
        <div className="h-[200px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bookings.map(booking => ({ name: new Date(booking.bookingDate).toLocaleDateString(), value: 1 }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </CardWrapper>
  );

  const CurrentUserCard = ({ id }) => (
    <CardWrapper id={id}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Current User</CardTitle>
        <Settings className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {currentUser && (
          <div className="space-y-2">
            <p className="text-2xl font-bold">{currentUser.name}</p>
            <p className="text-sm text-muted-foreground">{currentUser.email}</p>
            <p className="text-sm text-muted-foreground">Role: {currentUser.role}</p>
            <p className="text-sm text-muted-foreground">Tel: {currentUser.tel}</p>
            <p className="text-sm text-muted-foreground">Created: {new Date(currentUser.createdAt).toLocaleDateString()}</p>
          </div>
        )}
      </CardContent>
    </CardWrapper>
  );

  const getComponentByKey = (key, id) => {
    switch(key) {
      case 'companies': return <CompaniesCard id={id} />;
      case 'bookings': return <BookingsCard id={id} />;
      case 'me': return <CurrentUserCard id={id} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <aside 
        className={`fixed top-1/2 -translate-y-1/2 bg-secondary rounded-lg shadow-lg transition-all duration-300 ease-in-out z-40 ${sidebarVisible ? 'w-64' : 'w-12'} overflow-hidden`}
        onMouseEnter={() => setSidebarVisible(true)}
        onMouseLeave={() => setSidebarVisible(false)}
      >
        <div className="p-2 space-y-4">
          <div data-swapy-item="companies" className="flex items-center cursor-move p-2 hover:bg-primary hover:text-primary-foreground rounded transition-colors">
            <Building className="h-6 w-6" />
            {sidebarVisible && <span className="ml-2">Companies</span>}
          </div>
          <div data-swapy-item="bookings" className="flex items-center cursor-move p-2 hover:bg-primary hover:text-primary-foreground rounded transition-colors">
            <Calendar className="h-6 w-6" />
            {sidebarVisible && <span className="ml-2">Bookings</span>}
          </div>
          <div data-swapy-item="me" className="flex items-center cursor-move p-2 hover:bg-primary hover:text-primary-foreground rounded transition-colors">
            <User className="h-6 w-6" />
            {sidebarVisible && <span className="ml-2">User</span>}
          </div>
        </div>
      </aside>
      
      <main className="p-4">
        <header className="border-b pb-4 mb-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <Input type="search" placeholder="Search..." className="max-w-sm" />
          </div>
        </header>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div ref={dashboardRef} className="grid grid-cols-2 gap-4">
          {Object.entries(layout).map(([key, value]) => (
            <div key={key} data-swapy-slot={key}>
              {value.component && (
                <div data-swapy-item={value.component}>
                  {getComponentByKey(value.component, key)}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;