import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format, addDays, parseISO, isWithinInterval, isBefore } from 'date-fns';
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Booking } from '@/types/booking';
import { Company } from '@/types/company';

interface AnalyticsManagementProps {
  bookings: Booking[];
  companies: Company[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const AnalyticsManagement: React.FC<AnalyticsManagementProps> = ({ bookings, companies }) => {
  const today = useMemo(() => new Date(), []);
  const [startDate, setStartDate] = useState<Date | undefined>(today);
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(today, 31));
  const [excludePastBookings, setExcludePastBookings] = useState(false);

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const bookingDate = parseISO(booking.bookingDate);
      const isWithinRange = startDate && endDate && isWithinInterval(bookingDate, { start: startDate, end: endDate });
      if (excludePastBookings) {
        return isWithinRange && !isBefore(bookingDate, today);
      }
      return isWithinRange;
    });
  }, [bookings, startDate, endDate, excludePastBookings, today]);

  const companyBookings = useMemo(() => {
    const bookingsByCompany = filteredBookings.reduce((acc, booking) => {
      const companyName = booking.company.name;
      if (!acc[companyName]) {
        acc[companyName] = 0;
      }
      acc[companyName]++;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(bookingsByCompany)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredBookings]);

  const bookingsByDate = useMemo(() => {
    if (!startDate || !endDate) return [];

    const bookingCounts: Record<string, number> = {};
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      bookingCounts[format(currentDate, 'yyyy-MM-dd')] = 0;
      currentDate = addDays(currentDate, 1);
    }

    filteredBookings.forEach(booking => {
      const date = format(parseISO(booking.bookingDate), 'yyyy-MM-dd');
      if (bookingCounts[date] !== undefined) {
        bookingCounts[date]++;
      }
    });

    return Object.entries(bookingCounts).map(([date, count]) => ({ date, count }));
  }, [filteredBookings, startDate, endDate]);

  const companiesWithoutBookings = useMemo(() => {
    const companiesWithBookings = new Set(filteredBookings.map(booking => booking.company._id));
    return companies.filter(company => !companiesWithBookings.has(company._id));
  }, [filteredBookings, companies]);

  const handleStartDateChange = useCallback((date: Date | undefined) => {
    setStartDate(date);
    if (date && endDate && date > endDate) {
      setEndDate(addDays(date, 31));
    }
  }, [endDate]);

  const handleEndDateChange = useCallback((date: Date | undefined) => {
    setEndDate(date);
    if (date && startDate && date < startDate) {
      setStartDate(date);
    }
  }, [startDate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="companies">
          <TabsList>
            <TabsTrigger value="companies">Company Analytics</TabsTrigger>
            <TabsTrigger value="bookings">Booking Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="companies">
            <div className="mb-4 flex items-center space-x-2">
              <Switch
                id="exclude-past-bookings"
                checked={excludePastBookings}
                onCheckedChange={setExcludePastBookings}
              />
              <Label htmlFor="exclude-past-bookings">Exclude Past Bookings</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bookings by Company</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={companyBookings}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Company Booking Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={companyBookings}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="hsla(var(--foreground))"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {companyBookings.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Companies Without Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">Total: {companiesWithoutBookings.length}</p>
                  <ul className="list-disc pl-5">
                    {companiesWithoutBookings.slice(0, 5).map(company => (
                      <li key={company._id}>{company.name}</li>
                    ))}
                    {companiesWithoutBookings.length > 5 && <li>...</li>}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="bookings">
            <div className="mb-4 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="start-date">From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="start-date"
                      variant="outline"
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={handleStartDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="end-date">To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="end-date"
                      variant="outline"
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={handleEndDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bookings Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={bookingsByDate}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Cumulative Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={bookingsByDate.map((item, index, array) => ({
                      ...item,
                      cumulative: array.slice(0, index + 1).reduce((sum, i) => sum + i.count, 0)
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="cumulative" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AnalyticsManagement;