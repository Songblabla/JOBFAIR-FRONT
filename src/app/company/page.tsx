"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
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

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [error, setError] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await api.get<{ data: Company[] }>('companies');
      setCompanies(response.data.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError('Failed to fetch companies. Please try again.');
    }
  };

  const handleCreateBooking = async () => {
    if (!selectedCompany || !selectedDate) {
      setError('Please select both a company and a date.');
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
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Failed to create booking. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 flex flex-col justify-between min-h-screen relative">
        <header className="mb-8">
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
          className="flex flex-col gap-8 mb-16"
        >
          {companies.map((company) => (
            <Card key={company._id} className="w-full">
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
                  <p className="text-muted-foreground mb-2">
                    <strong>Business:</strong> {company.business}
                  </p>
                  <p className="text-muted-foreground mb-2">
                    <strong>Address:</strong> {company.address}, {company.postalcode}
                  </p>
                  <p className="text-muted-foreground mb-2">
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
                        Create your booking here. Click save when you're done.
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
          ))}
        </motion.div>

        <footer className="text-center text-muted-foreground text-sm mt-16">
          © 2024 Job Fair. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
