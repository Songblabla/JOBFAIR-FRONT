"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Building2,
  CalendarDays,
  BarChart3,
  Search,
  Plus,
  AlertCircle,
  Edit,
  Trash,
  Eye,
  Settings,
  CalendarIcon
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import toast, { Toaster } from 'react-hot-toast';
import api from "@/lib/axios";

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

interface User {
  _id: string;
  name: string;
  email: string;
  tel: string;
  role: "user" | "admin";
}

interface Booking {
  _id: string;
  bookingDate: string;
  user: string;
  company: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companySearchTerm, setCompanySearchTerm] = useState("");
  const [bookingSearchTerm, setBookingSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateCompanyDialogOpen, setIsCreateCompanyDialogOpen] = useState(false);
  const [newCompany, setNewCompany] = useState<Omit<Company, '_id'>>({
    name: '',
    address: '',
    business: '',
    province: '',
    postalcode: '',
    tel: '',
    picture: '',
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [confirmationInput, setConfirmationInput] = useState('');
  const [hidePastBookings, setHidePastBookings] = useState(true);
  const [sortBookingsBy, setSortBookingsBy] = useState<'date' | 'company'>('date');
  const [isAddBookingDialogOpen, setIsAddBookingDialogOpen] = useState(false);
  const [isEditBookingDialogOpen, setIsEditBookingDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isDeleteBookingDialogOpen, setIsDeleteBookingDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [deleteBookingConfirmation, setDeleteBookingConfirmation] = useState('');

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [userResponse, bookingsResponse, companiesResponse] = await Promise.all([
          api.get("/auth/me"),
          api.get("/bookings"),
          api.get("/companies")
        ]);

        setUser(userResponse.data.data);
        setBookings(bookingsResponse.data.data || []);
        setCompanies(companiesResponse.data.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("An error occurred while fetching data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCompanies = companies.filter(company => {
    const name = (company.name || '').toLowerCase();
    const business = (company.business || '').toLowerCase();
    const searchTerm = companySearchTerm.toLowerCase();
    return name.includes(searchTerm) || business.includes(searchTerm);
  });

  const handleViewCompany = (id: string) => {
    router.push(`/company/${id}`);
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setIsEditDialogOpen(true);
  };

  const handleCreateCompany = async () => {
    try {
      // console.log(newCompany);
      const response = await api.post('companies', newCompany, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCompanies([...companies, response.data]);
      toast.success("Company created successfully!");
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
      console.error("Error creating new company:", error);
      toast.error("Failed to create company. Please try again.");
    }
  };

  const handleUpdateCompany = async () => {
    if (!editingCompany) {
      toast.error("Please fill in all fields.");
      return;
    }
    try {
      const response = await api.put(`companies/${editingCompany._id}`, editingCompany, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCompanies(companies.map(c => c._id === editingCompany._id ? response.data : c));
      toast.success("Company updated successfully!");
      setIsEditDialogOpen(false);
      setLoading(true);
      
      setTimeout(() => {
        window.location.reload();
      }, 1000); 
    } catch (error) {
      console.error("Error updating company:", error);
      toast.error("Failed to update company. Please try again.");
    }
  };

  const handleDeleteCompany = async (company: Company) => {
    setCompanyToDelete(company);
    setIsDeleteDialogOpen(true);
  };
  
  const processDeleteCompany = async () => {
    if (!companyToDelete || confirmationInput !== companyToDelete.name) {
      toast.error("Company name doesn't match. Deletion cancelled.");
      return;
    }
  
    try {
      await api.delete(`companies/${companyToDelete._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCompanies(companies.filter(c => c._id !== companyToDelete._id));
      toast.success("Company deleted successfully!");
      setIsDeleteDialogOpen(false);
      setCompanyToDelete(null);
      setConfirmationInput('');
      setLoading(true);
      
      setTimeout(() => {
        window.location.reload();
      }, 1000); 
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error("Failed to delete company. Please try again.");
    }
  };

  const filteredAndSortedBookings = useMemo(() => {
    let filtered = [...bookings];
    
    if (hidePastBookings) {
      const now = new Date();
      filtered = filtered.filter(booking => new Date(booking.bookingDate) >= now);
    }
    
    if (bookingSearchTerm) {
      filtered = filtered.filter(booking => 
        booking.user.toLowerCase().includes(bookingSearchTerm.toLowerCase()) ||
        booking.company.name.toLowerCase().includes(bookingSearchTerm.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => {
      if (sortBookingsBy === 'date') {
        return new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime();
      } else {
        return a.company.name.localeCompare(b.company.name);
      }
    });
  }, [bookings, hidePastBookings, bookingSearchTerm, sortBookingsBy]);

  const handleCreateBooking = async () => {
    if (!selectedCompany || !selectedDate) {
      toast.error("Please select both a company and a date.");
      return;
    }
    try {
      await api.post(
        `companies/${selectedCompany._id}/bookings`,
        {
          bookingDate: selectedDate.toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSelectedCompany(null);
      setSelectedDate(undefined);
      setIsAddBookingDialogOpen(false);
      const bookingsResponse = await api.get("/bookings");
      setBookings(bookingsResponse.data.data || []);
      toast.success("Booking created successfully!");
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Failed to create booking. Please try again.");
    }
  };

  const handleDeleteBooking = (booking: Booking) => {
    // console.log(booking)
    setBookingToDelete(booking);
    setIsDeleteBookingDialogOpen(true);
  };

  const processDeleteBooking = async () => {
    if (!bookingToDelete || deleteBookingConfirmation !== bookingToDelete.company.name) {
      toast.error("Company name doesn't match. Deletion cancelled.");
      return;
    }
  
    try {
      await api.delete(`bookings/${bookingToDelete._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const bookingsResponse = await api.get("/bookings");
      setBookings(bookingsResponse.data.data || []);
      toast.success('Booking deleted successfully!');
      setIsDeleteBookingDialogOpen(false);
      setBookingToDelete(null);
      setDeleteBookingConfirmation('');
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking. Please try again.');
    }
  };

  const handleUpdateBooking = async () => {
    if (!editingBooking || !selectedDate) {
      toast.error("Please select a new date.");
      return;
    }
    try {
      await api.put(`bookings/${editingBooking._id}`, {
        bookingDate: selectedDate.toISOString()
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const bookingsResponse = await api.get("/bookings");
      setBookings(bookingsResponse.data.data || []);
      setIsEditBookingDialogOpen(false);
      toast.success('Booking updated successfully!');
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking. Please try again.');
    }
  };


  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Unable to fetch user data. Please try logging in again.</AlertDescription>
      </Alert>
    );
  }

  if (user.role !== "admin") {
    router.push("/company");
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Toaster position="top-right" />
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Welcome, {user.name}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Companies</CardTitle>
              <Building2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bookings</CardTitle>
              <CalendarDays className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analytics</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Coming Soon</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Role</CardTitle>
              <User className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.role}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="companies" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="companies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Company Management</CardTitle>
                <CardDescription>Oversee and manage registered companies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="relative flex-1 mr-4">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search companies..."
                      className="pl-8 w-full"
                      value={companySearchTerm}
                      onChange={(e) => setCompanySearchTerm(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => setIsCreateCompanyDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Company
                  </Button>
                </div>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Business</TableHead>
                        <TableHead>Province</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCompanies.map((company) => (
                        <TableRow key={company._id}>
                          <TableCell className="font-medium">{company.name}</TableCell>
                          <TableCell>{company.business}</TableCell>
                          <TableCell>{company.province}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <Settings className="h-4 w-4"/> 
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewCompany(company._id)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  <span>View</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditCompany(company)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteCompany(company)}>
                                  <Trash className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Booking Management</CardTitle>
                <CardDescription>Overview of all interview bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="relative flex-1 mr-4">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search bookings..."
                      className="pl-8 w-full"
                      value={bookingSearchTerm}
                      onChange={(e) => setBookingSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => setIsAddBookingDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Booking
                  </Button>
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hide-past-bookings"
                      checked={hidePastBookings}
                      onCheckedChange={setHidePastBookings}
                    />
                    <Label htmlFor="hide-past-bookings">Hide Past Bookings</Label>
                  </div>
                  <Select value={sortBookingsBy} onValueChange={(value: 'date' | 'company') => setSortBookingsBy(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Sort by Date</SelectItem>
                      <SelectItem value="company">Sort by Company</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedBookings.map((booking) => (
                        <TableRow key={booking._id}>
                          <TableCell>{new Date(booking.bookingDate).toLocaleDateString()}</TableCell>
                          <TableCell>{booking.user}</TableCell>
                          <TableCell>{booking.company.name}</TableCell>
                          <TableCell>
                            <Badge variant={new Date(booking.bookingDate) < new Date() ? "secondary" : "outline"}>
                              {new Date(booking.bookingDate) < new Date() ? "Past" : "Scheduled"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <Settings className="h-4 w-4"/> 
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setEditingBooking(booking);
                                  setSelectedDate(new Date(booking.bookingDate));
                                  setIsEditBookingDialogOpen(true);
                                }}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteBooking(booking)}>
                                  <Trash className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>
              Update the details below to modify the company.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {editingCompany && Object.keys(editingCompany).map((key) => (
              key !== '_id' && key !== "__v" && key !== "id" && (
                <div className="grid grid-cols-4 items-center gap-4" key={key}>
                  <Label htmlFor={key} className="text-right">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Label>
                  <Input
                    id={key}
                    value={editingCompany[key as keyof Company] ?? ''}
                    onChange={(e) =>
                      setEditingCompany((prev) => ({
                        ...(prev as Company),
                        [key]: e.target.value,
                      }))
                    }
                    className="col-span-3"
                  />
                </div>
              )
            ))}
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleUpdateCompany}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateCompanyDialogOpen} onOpenChange={setIsCreateCompanyDialogOpen}>
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
              Create Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Company Deletion</DialogTitle>
            <DialogDescription>
              This is a destructive action and cannot be undone. To confirm deletion, please type the company name: <strong>{companyToDelete?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="companyName" className="text-right">
                Company Name
              </Label>
              <Input
                id="companyName"
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={processDeleteCompany}
              disabled={confirmationInput !== companyToDelete?.name}
            >
              Delete Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddBookingDialogOpen} onOpenChange={setIsAddBookingDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Booking</DialogTitle>
            <DialogDescription>
              Select a company and date for the new booking.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company" className="text-right">Company</Label>
              <Select onValueChange={(value) => setSelectedCompany(companies.find(c => c._id === value) || null)}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company._id} value={company._id}>{company.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
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
            <Button onClick={handleCreateBooking}>Create Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditBookingDialogOpen} onOpenChange={setIsEditBookingDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>
              Change the date of the selected booking.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">New Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
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
            <Button onClick={handleUpdateBooking}>Update Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteBookingDialogOpen} onOpenChange={setIsDeleteBookingDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Booking Deletion</DialogTitle>
            <DialogDescription>
              This is a destructive action and cannot be undone. To confirm deletion, please type the company name: <strong>{bookingToDelete?.company.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="companyName" className="text-right">
                Company Name
              </Label>
              <Input
                id="companyName"
                value={deleteBookingConfirmation}
                onChange={(e) => setDeleteBookingConfirmation(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteBookingDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={processDeleteBooking}
              disabled={deleteBookingConfirmation !== bookingToDelete?.company.name}
            >
              Delete Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;