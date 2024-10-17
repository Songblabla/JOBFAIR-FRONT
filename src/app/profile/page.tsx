"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Calendar,
  Clock,
  Building,
  Eye,
  EyeOff,
  UserCircle,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  name: string;
  email: string;
  tel: string;
  role: "user" | "admin";
}

interface Booking {
  _id: string;
  company: Company;
  bookingDate: string;
  user: string;
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

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingSearchTerm, setBookingSearchTerm] = useState("");
  const [companySearchTerm, setCompanySearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [revealJobFairCard, setRevealJobFairCard] = useState(false);

  const { theme } = useTheme();
  const router = useRouter();

  const handleCompanyRoute = () => {
    router.push("/company");
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  

  const fetchUserData = async () => {
    try {
      const response = await api.get<{ data: User }>("auth/me");
      setUser(response.data.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchBookings = async () => {
    if (!user) return;
    try {
      const response = await api.get<{ data: Booking[] }>("bookings");
      // console.log(user._id);
      // console.log(response.data.data)
      const userBookings = response.data.data.filter(
        (booking) => booking.user === user._id
      );
      setBookings(userBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await api.get<{ data: Company[] }>("companies");
      setCompanies(response.data.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const gradientStyle = useMemo(() => {
    const hue1 = Math.floor(Math.random() * 360);
    const hue2 = (hue1 + 180) % 360;
    return {
      light: `linear-gradient(135deg, hsl(${hue1}, 70%, 85%) 0%, hsl(${hue2}, 70%, 85%) 100%)`,
      dark: `linear-gradient(135deg, hsl(${hue1}, 70%, 30%) 0%, hsl(${hue2}, 70%, 30%) 100%)`,
    };
  }, []);

  const filteredBookings = useMemo(() => {
    if (bookings.length == 0) return [];
    return bookings
      .filter((booking) =>
        booking.company.name
          .toLowerCase()
          .includes(bookingSearchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === "date")
          return (
            new Date(a.bookingDate).getTime() -
            new Date(a.bookingDate).getTime()
          );
        return a.company.name.localeCompare(b.company.name);
      });
  }, [bookings, bookingSearchTerm, sortBy]);

  const filteredCompanies = useMemo(() => {
    if (companies.length == 0) return [];
    return companies.filter(
      (company) =>
        company.name.toLowerCase().includes(companySearchTerm.toLowerCase()) ||
        company.business.toLowerCase().includes(companySearchTerm.toLowerCase())
    );
  }, [companies, companySearchTerm]);

  const handleCompanyIdRoute = ({ id }: { id: string }) => {
    router.push(`/company/${id}`);
  };

  useEffect(() => {
      if (user) {
        fetchBookings();
        fetchCompanies();
      }
    }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card with random gradient */}
          <Card
            className="lg:col-span-1 overflow-hidden"
            style={{
              background:
                theme === "dark" ? gradientStyle.dark : gradientStyle.light,
            }}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32">
                  <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl sm:text-2xl font-semibold">
                  {user?.name.split("@")[0]}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {user?.email}
                </p>
                <Card className="w-full bg-white dark:bg-gray-800">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium">Job Fair Card</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setRevealJobFairCard(!revealJobFairCard)}
                      >
                        {revealJobFairCard ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div
                      className={`transition-all duration-300 ${
                        revealJobFairCard ? "" : "blur-sm"
                      }`}
                      onClick={() =>
                        !revealJobFairCard && setRevealJobFairCard(true)
                      }
                    >
                      <p className="text-sm mb-1">ID: {user?._id}</p>
                      <p className="text-sm mb-1">Role: {user?.role}</p>
                      <p className="text-sm">Phone: {user?.tel}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Bookings Console with micro navbar */}
          <Card className="lg:col-span-2 bg-gray-50 dark:bg-gray-900">
            <CardContent className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-semibold">
                  Interview Bookings
                </h2>
                {filteredBookings.length > 0 && (
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search bookings..."
                        value={bookingSearchTerm}
                        onChange={(e) => setBookingSearchTerm(e.target.value)}
                        className="pl-10 w-full"
                      />
                    </div>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Sort by Date</SelectItem>
                        <SelectItem value="company">Sort by Company</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              {filteredBookings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {filteredBookings.map((booking) => (
                      <Button
                        key={booking._id}
                        variant={
                          selectedBooking?._id === booking._id
                            ? "default"
                            : "outline"
                        }
                        className="w-full justify-start"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        {booking.company.name}
                      </Button>
                    ))}
                  </div>
                  <Card className="bg-white dark:bg-gray-800">
                    <CardContent className="p-4">
                      {selectedBooking ? (
                        <div>
                          <h3 className="text-lg font-medium mb-2">
                            {selectedBooking.company.name}
                          </h3>
                          <div className="flex items-center mb-2">
                            <UserCircle className="w-4 h-4 mr-2" />
                            <p className="text-sm">
                              User: {selectedBooking.user}
                            </p>
                          </div>
                          <div className="flex items-center mb-2">
                            <Calendar className="w-4 h-4 mr-2" />
                            <p className="text-sm">
                              Date: {formatDate(selectedBooking.bookingDate)}
                            </p>
                          </div>
                          <div className="flex items-center mb-2">
                            <Clock className="w-4 h-4 mr-2" />
                            <p className="text-sm">
                              Time: {formatTime(selectedBooking.bookingDate)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Select a booking to view details
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <Calendar className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-xl font-semibold text-gray-500 mb-2">
                    No Bookings Yet
                  </p>
                  <p className="text-sm text-gray-400 text-center mb-4">
                    You haven&rsquo;t made any interview bookings. Start by
                    exploring companies and scheduling your interviews!
                  </p>
                  <Button onClick={handleCompanyRoute}>
                    <Building className="mr-2 h-4 w-4" />
                    Explore Companies
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {user?.role === "admin" && (
          <Card className="bg-gray-50 dark:bg-gray-900">
            <CardContent className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-semibold">
                  Company Management
                </h2>
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search companies..."
                    value={companySearchTerm}
                    onChange={(e) => setCompanySearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              </div>
              <Carousel
                opts={{
                  align: "start",
                  loop: false,
                }}
                className="w-full"
              >
                <CarouselContent>
                  {filteredCompanies.map((company) => (
                    <CarouselItem
                      key={company._id}
                      className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                    >
                      <div className="p-1">
                        <Card>
                          <CardContent className="flex flex-col items-start p-6">
                            <h3 className="text-lg font-medium mb-2">
                              {company.name}
                            </h3>
                            <p className="text-sm mb-4">{company.business}</p>
                            <Button onClick={() => handleCompanyIdRoute({ id: company._id })} size="sm">Manage</Button>
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </CardContent>
          </Card>
        )}
      </div>
      <footer className="text-center text-muted-foreground text-sm my-8">
        © 2024 Job Fair. All rights reserved.
      </footer>
    </div>
  );
};

export default ProfilePage;
