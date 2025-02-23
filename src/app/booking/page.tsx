"use client";

import React, { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { CalendarIcon, ChevronRight, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import toast from "react-hot-toast";
import { User } from "@/types/user";
import { Company } from "@/types/company";
import { Booking } from "@/types/booking";

export default function Bookings() {
  const [user, setUser] = useState<User | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const fetchBookings = useCallback(async () => {
    try {
      const userId = user?._id;
      if (!userId) {
        return;
      }
      const response = await api.get<{ data: Booking[] }>("bookings");
      const userBookings = response.data.data.filter(
        (booking) => String(booking.user) === String(user._id)
      );
      setBookings(userBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to fetch bookings. Please try again.");
    }
  }, [user]);

  const fetchCompanies = async () => {
    try {
      const response = await api.get<{ data: Company[] }>("companies");
      setCompanies(response.data.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
      setError("Failed to fetch companies. Please try again.");
    }
  };

  const handleCreateBooking = async () => {
    if (!selectedCompany || !selectedDate) {
      toast.error("Please select both a company and a date.");
      return;
    }
    try {
      await api.post(
        `companies/${selectedCompany._id}/bookings`,
        {
          bookingDate: new Date(selectedDate).toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSelectedCompany(null);
      setSelectedDate(undefined);
      setIsDialogOpen(false);
      fetchBookings();
      toast.success("Booking created successfully!");
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Failed to create booking. Please try again.");
    }
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      await api.delete(`bookings/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchBookings();
      toast.success("Booking deleted successfully!");
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error("Failed to delete booking. Please try again.");
    }
  };

  const handleUpdateBooking = async (id: string, newDate: Date) => {
    try {
      await api.put(
        `bookings/${id}`,
        {
          bookingDate: newDate.toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchBookings();
      toast.success("Booking updated successfully!");
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Failed to update booking. Please try again.");
    }
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }
      const response = await api.get<{ data: User }>("auth/me");
      setUser(response.data.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchUserData(); // Fetch user first
      await fetchCompanies(); // Fetch companies second
    };
    initialize();
  }, []);

  useEffect(() => {
    if (user) {
      fetchBookings(); // Fetch bookings only after user is loaded
    }
  }, [user, fetchBookings]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-16 flex flex-col justify-between min-h-screen relative">
        <header className="mb-4 relative">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl font-bold mb-4"
          >
            Interview Bookings
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl text-muted-foreground"
          >
            Manage your interview sessions with top companies.
          </motion.p>
        </header>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {bookings.length < 3 && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mb-6 group">
                <Plus className="mr-2 h-4 w-4" /> Book New Interview
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background">
              <DialogHeader>
                <DialogTitle>Book New Interview</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select
                  onValueChange={(value) =>
                    setSelectedCompany(
                      companies.find((company) => company._id === value) || null
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company._id} value={company._id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      {selectedDate ? (
                        format(selectedDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button onClick={handleCreateBooking} className="w-full group">
                  Book Interview
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
        >
          {bookings.map((booking) => (
            <Card key={booking._id}>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4">
                  {booking.company.name}
                </h2>
                <p className="text-muted-foreground mb-4">
                  <strong>Date:</strong>{" "}
                  {format(new Date(booking.bookingDate), "PPP")}
                </p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full mb-4">
                      Change Date
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={new Date(booking.bookingDate)}
                      onSelect={(date) =>
                        date && handleUpdateBooking(booking._id, date)
                      }
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteBooking(booking._id)}
                  className="w-full group"
                >
                  <X className="mr-2 h-4 w-4" /> Cancel Booking
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
                </Button>
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
