"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu"
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
   
type Checked = DropdownMenuCheckboxItemProps["checked"]

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

interface NewCompany {
    name: string;
    address: string;
    business: string;
    province: string;
    postalcode: string;
    tel: string;
    picture: string;
}

interface User {
    _id: string;
    name: string;
    email: string;
    tel: string;
    role: 'user' | 'admin';
}

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [error, setError] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateCompanyDialogOpen, setIsCreateCompanyDialogOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterBusiness, setFilterBusiness] = useState('');
  const [userData, setUserData] = useState<User | null>(null);
  const [newCompany, setNewCompany] = useState<NewCompany>({
        name: '',
        address: '',
        business: '',
        province: '',
        postalcode: '',
        tel: '',
        picture: '',
    });
const [businessOptions, setBusinessOptions] = useState<string[]>([]);

useEffect(() => {
    fetchCompanies();
    handleGetMe();
}, []);

useEffect(() => {
    filterAndSortCompanies();
}, [companies, sortOrder, filterBusiness]);

  const fetchCompanies = async () => {
    try {
      const response = await api.get<{ data: Company[] }>('companies');
      setCompanies(response.data.data);

      const uniqueBusinesses = Array.from(new Set(response.data.data.map(company => company.business)));
      setBusinessOptions(uniqueBusinesses);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to fetch companies. Please try again.');
    }
  };

  const filterAndSortCompanies = () => {
    const filtered = companies.filter(company =>
        company.business.toLowerCase().includes(filterBusiness.toLowerCase())
      );

    filtered.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

    setFilteredCompanies(filtered);
  };

  const handleCreateBooking = async () => {
    if (!selectedCompany || !selectedDate) {
      toast.error('Please select both a company and a date.');
      return;
    }
    try {
      await api.post(`companies/${selectedCompany._id}/bookings`, {
        bookingDate: new Date(selectedDate).toISOString()
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
        setSelectedCompany(null);
        setSelectedDate(undefined);
        setIsDialogOpen(false);
        toast.success('Booking created successfully!');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.');
    }
  };

  const handleGetMe = async () => {
    try {
        const response = await api.get(`auth/me`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
      
          if (response?.data) {
            setUserData(response.data.data);
          }
    } catch (error) {
      console.error('Error get me:', error);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleCreateCompany = async () => {
    if (!newCompany) {
        setError('Please fill in all fields.');
        return;
    }
    try {
      await api.post('companies', newCompany, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchCompanies();
      setIsCreateCompanyDialogOpen(false);
      setNewCompany({
        name: '',
        address: '',
        business: '',
        province: '',
        postalcode: '',
        tel: '',
        picture: '',
      });
    } catch (error) {
        console.error('Error creating new company:', error);
        toast.error('Failed to create company. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 flex flex-col justify-between min-h-screen relative">
        <header className="mb-4">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl font-bold mb-4"
          >
            Company Information
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl text-muted-foreground"
          >
            Discover the companies and their information.
            {userData?.role === 'admin' && (
              <>
                <Dialog open={isCreateCompanyDialogOpen} onOpenChange={setIsCreateCompanyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-primary mt-4 mx-4">Create Company</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create New Company</DialogTitle>
                      <DialogDescription>
                        Fill in the details below to create a new company.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      {Object.keys(newCompany).map((key) => (
                        <div className="grid grid-cols-4 items-center gap-4" key={key}>
                          <Label htmlFor={key} className="text-right">
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </Label>
                          <Input
                            id={key}
                            value={newCompany[key as keyof typeof newCompany]}
                            onChange={(e) =>
                              setNewCompany((prev) => ({
                                ...prev,
                                [key]: e.target.value,
                              }))
                            }
                            className="col-span-3"
                          />
                        </div>
                      ))}
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleCreateCompany}>
                        Confirm
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </motion.p>

          <div className="bg-background z-10 py-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <Input
                        placeholder="Filter by Business"
                        value={filterBusiness}
                        onChange={(e) => setFilterBusiness(e.target.value)}
                        className="w-25"
                        disabled
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button>Filter by Business</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>Business</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {businessOptions.map((business) => (
                                <DropdownMenuItem
                                    key={business}
                                    onClick={() => setFilterBusiness(business)}
                                >
                                    {business}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setFilterBusiness('')}>
                                Clear Filter
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button onClick={toggleSortOrder}>
                        Sort by Name ({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})
                    </Button>
                </div>
            </div>
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
          className="flex flex-col gap-8 mb-16"
        >
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((company) => (
              <Card key={company._id} className="w-full dark:bg-neutral-800">
                <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center">
                  {company.picture && (
                    <div className="md:w-1/4 flex-shrink-0 mb-4 md:mb-0 md:mr-8 max-w-xs flex justify-center items-center">
                      <Image
                        src={company.picture}
                        alt={`${company.name} logo`}
                        className="h-auto object-contain"
                        width={100}
                        height={100}
                      />
                    </div>
                  )}
                  <div className="w-full md:w-2/3">
                    <h2 className="text-2xl font-semibold mb-4">{company.name}</h2>
                    <p className="text-muted-foreground mb-2 dark:text-neutral-200">
                      <strong>Business:</strong> {company.business}
                    </p>
                    <p className="text-muted-foreground mb-2 dark:text-neutral-200">
                      <strong>Address:</strong> {company.address}, {company.postalcode}
                    </p>
                    <p className="text-muted-foreground mb-2 dark:text-neutral-200">
                      <strong>Phone:</strong> {company.tel}
                    </p>
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedCompany(company)}
                      >
                        Create Booking
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Create New Booking</DialogTitle>
                        <DialogDescription>
                          Create your booking here. Click save when you&apos;re done.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="company" className="text-right">
                            Company
                          </Label>
                          <Input
                            id="company"
                            value={selectedCompany?.name || ''}
                            className="col-span-3"
                            readOnly
                          />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                          <Label htmlFor="bookingDate" className="text-right">
                            Booking Date
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-[240px] justify-start text-left font-normal",
                                  !selectedDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" onClick={handleCreateBooking}>
                          Confirm
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center text-muted-foreground">
              No companies found matching your filter criteria.
            </div>
          )}
        </motion.div>

        <footer className="text-center text-muted-foreground text-sm mt-16">
          © 2024 Job Fair. All rights reserved.
        </footer>
      </div>
    </div>
  );
}