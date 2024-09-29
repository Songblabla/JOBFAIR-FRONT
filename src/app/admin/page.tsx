"use client";

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, UserPlus, Building, Calendar, ChevronRight } from 'lucide-react';
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import Link from "next/link";

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface Company {
  _id: string;
  name: string;
  address: string;
  business: string;
  province: string;
  postalcode: string;
  tel: string;
  picture: string;
}

interface Booking {
  _id: string;
  user: User;
  company: Company;
  bookingDate: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [newCompany, setNewCompany] = useState<Omit<Company, '_id'>>({ 
    name: '', address: '', business: '', province: '', postalcode: '', tel: '', picture: '' 
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get<User[]>('/api/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Please try again.');
    }
  }, []);

  const fetchCompanies = useCallback(async () => {
    try {
      const response = await axios.get<Company[]>('/api/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError('Failed to fetch companies. Please try again.');
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const response = await axios.get<Booking[]>('/api/bookings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to fetch bookings. Please try again.');
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchUsers();
    fetchCompanies();
    fetchBookings();
  }, [fetchUsers, fetchCompanies, fetchBookings]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleCreateCompany = async () => {
    try {
      await axios.post('/api/companies', newCompany, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setIsDialogOpen(false);
      fetchCompanies();
    } catch (error) {
      console.error('Error creating company:', error);
      setError('Failed to create company. Please try again.');
    }
  };

  const handleDeleteCompany = async (id: string) => {
    try {
      await axios.delete(`/api/companies/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      setError('Failed to delete company. Please try again.');
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-16 flex flex-col justify-between min-h-screen relative">
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
            Admin Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl text-muted-foreground"
          >
            Manage users, companies, and bookings.
          </motion.p>
        </header>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 rounded-xl bg-muted p-1">
              <TabsTrigger value="users" className="rounded-lg">Users</TabsTrigger>
              <TabsTrigger value="companies" className="rounded-lg">Companies</TabsTrigger>
              <TabsTrigger value="bookings" className="rounded-lg">Bookings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">User Management</h2>
                  <ul className="space-y-2 mb-6">
                    {users.map(user => (
                      <li key={user._id} className="flex justify-between items-center">
                        <span>{user.name} - {user.email}</span>
                        <Button variant="outline" size="sm" className="group">
                          View Details
                          <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="companies">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">Company Management</h2>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="mb-4 group">
                        <Plus className="mr-2 h-4 w-4" /> Add Company
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Company</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input 
                          placeholder="Company Name" 
                          value={newCompany.name} 
                          onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                        />
                        <Input 
                          placeholder="Address" 
                          value={newCompany.address} 
                          onChange={(e) => setNewCompany({...newCompany, address: e.target.value})}
                        />
                        <Input 
                          placeholder="Business" 
                          value={newCompany.business} 
                          onChange={(e) => setNewCompany({...newCompany, business: e.target.value})}
                        />
                        <Input 
                          placeholder="Province" 
                          value={newCompany.province} 
                          onChange={(e) => setNewCompany({...newCompany, province: e.target.value})}
                        />
                        <Input 
                          placeholder="Postal Code" 
                          value={newCompany.postalcode} 
                          onChange={(e) => setNewCompany({...newCompany, postalcode: e.target.value})}
                        />
                        <Input 
                          placeholder="Telephone" 
                          value={newCompany.tel} 
                          onChange={(e) => setNewCompany({...newCompany, tel: e.target.value})}
                        />
                        <Input 
                          placeholder="Picture URL" 
                          value={newCompany.picture} 
                          onChange={(e) => setNewCompany({...newCompany, picture: e.target.value})}
                        />
                        <Button onClick={handleCreateCompany}>Create Company</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <ul className="space-y-2 mb-6">
                    {companies.map(company => (
                      <li key={company._id} className="flex justify-between items-center">
                        <span>{company.name}</span>
                        <div>
                          <Button variant="outline" size="sm" className="mr-2 group">
                            Edit
                            <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
                          </Button>
                          <Button onClick={() => handleDeleteCompany(company._id)} variant="destructive" size="sm">Delete</Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="bookings">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">Booking Management</h2>
                  <ul className="space-y-2 mb-6">
                    {bookings.map(booking => (
                      <li key={booking._id} className="flex justify-between items-center">
                        <span>{booking.user.name} - {booking.company.name} - {new Date(booking.bookingDate).toLocaleDateString()}</span>
                        <Button variant="outline" size="sm" className="group">
                          View Details
                          <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        <footer className="text-center text-muted-foreground text-sm mt-16">
          © 2024 Job Fair. All rights reserved.
        </footer>
      </div>
    </div>
  );
}