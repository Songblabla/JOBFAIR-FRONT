"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ChevronRight, X, CalendarDays } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Company } from "@/types/company";
import { User } from "@/types/user";
import { Booking } from "@/types/booking";
import { motion } from "framer-motion";
import { format } from "date-fns";

const CompanyPage = ({ params }: { params: { id: string } }) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userData, setUserData] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedCompany, setEditedCompany] = useState<Company | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (params.id) {
      fetchCompany(params.id);
    }
  }, [params.id]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchCompany = async (companyId: string) => {
    try {
      const response = await api.get<{ data: Company }>(
        `companies/${companyId}`
      );
      setCompany(response.data.data);
      setEditedCompany(response.data.data);
    } catch (error) {
      console.error("Error fetching company:", error);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await api.get(`auth/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response?.data) {
        setUserData(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch user data. Please try again.");
      console.error("Error get me:", error);
    }
  };

  const fetchBookings = useCallback(async () => {
    try {
      const response = await api.get<{ data: Booking[] }>("bookings");
      const userBookings = response.data.data.filter(
        (booking) => booking.company.name === company?.name && String(booking.user) === String(userData?._id)
      );
      setBookings(userBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to fetch bookings. Please try again.");
    }
  }, [company?.name, userData?._id]);

  const handleUpdateCompany = async () => {
    if (!editedCompany) {
      toast.error("Please fill in all fields.");
      return;
    }
    try {
      if (!company) {
        toast.error("Company data is not available.");
        return;
      }
      await api.put(`companies/${company._id}`, editedCompany, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCompany(editedCompany);
      toast.success("Company updated successfully!");
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating company:", error);
      toast.error("Failed to update company. Please try again.");
    }
  };

  const handleDeleteCompany = async () => {
    if (!company) return;
    try {
      await api.delete(`companies/${company._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Company deleted successfully!");
      router.push("/companies");
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error("Failed to delete company. Please try again.");
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

  useEffect(() => {
    if (company) fetchBookings();
  }, [company, fetchBookings]);

  return (
    <div className="container mx-auto px-4 py-8">
      {company ? (
        <Card key={company._id} className="w-full dark:bg-neutral-800">
          <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center">
            {company.picture && (
              <div className="md:w-1/4 flex-shrink-0 mb-4 md:mb-0 md:mr-8 max-w-xs flex justify-center items-center">
                <Image
                  src={company.picture}
                  alt={`${company.name} logo`}
                  className="h-auto object-contain rounded-lg"
                  width={100}
                  height={100}
                />
              </div>
            )}
            <div className="w-full md:w-2/3">
              <div>
                <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                  {company.name}
                </h2>
                <p className="text-gray-600 mb-2 dark:text-neutral-200">
                  <strong>Business:</strong> {company.business}
                </p>
                <p className="text-gray-600 mb-2 dark:text-neutral-200">
                  <strong>Address:</strong> {company.address},{" "}
                  {company.postalcode}
                </p>
                <p className="text-gray-600 mb-2 dark:text-neutral-200">
                  <strong>Phone:</strong> {company.tel}
                </p>
              </div>
            </div>
            {userData?.role === "admin" && (
              <div className="mt-4 md:mt-0 md:ml-4 flex flex-col gap-2 md:flex-row md:gap-4">
                <Button
                  className="btn-primary w-full md:w-auto"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  className="w-full md:w-auto"
                  onClick={handleDeleteCompany}
                >
                  Delete
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <p className="text-center text-gray-500">Loading...</p>
      )}

      {userData?.role === "admin" ? (
        bookings.length > 0 ? (
          <div>
            <Card className="mt-8">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bookings</CardTitle>
                <CalendarDays className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bookings.length}</div>
              </CardContent>
            </Card>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 mt-8"
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
          </div>
        ) : (
          <Card className="mt-8">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bookings</CardTitle>
              <CalendarDays className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings</CardTitle>
            <CalendarDays className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>
              Update the details below to modify the company.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {editedCompany &&
              Object.keys(editedCompany)
                .filter((key) => key !== "id" && key !== "__v" && key !== "_id")
                .map((key) => (
                  <div
                    className="grid grid-cols-4 items-center gap-4"
                    key={key}
                  >
                    <Label htmlFor={key} className="text-right">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Label>
                    <Input
                      id={key}
                      value={editedCompany[key as keyof Company] ?? ""}
                      onChange={(e) =>
                        setEditedCompany((prev) => ({
                          ...(prev as Company),
                          [key]: e.target.value,
                        }))
                      }
                      className="col-span-3"
                    />
                  </div>
                ))}
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleUpdateCompany}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyPage;
