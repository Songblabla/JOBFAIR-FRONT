import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar"
import { Search, Plus, Settings, Edit, Trash, CalendarIcon } from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import toast from 'react-hot-toast';
import api from "@/lib/axios";
import { Company } from '@/types/company';
import { Booking } from '@/types/booking';

interface BookingManagementProps {
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  companies: Company[];
}

const BookingManagement: React.FC<BookingManagementProps> = ({ bookings, setBookings, companies }) => {
  const [bookingSearchTerm, setBookingSearchTerm] = useState("");
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

  const filteredAndSortedBookings = useMemo(() => {
    let filtered = [...bookings];
    
    if (hidePastBookings) {
      const now = new Date();
      filtered = filtered.filter(booking => new Date(booking.bookingDate) >= now);
    }
    
    if (bookingSearchTerm) {
      filtered = filtered.filter(booking => 
        String(booking.user).toLowerCase().includes(bookingSearchTerm.toLowerCase()) ||
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
      const response = await api.post(
        `companies/${selectedCompany._id}/bookings`,
        {
          bookingDate: selectedDate.toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setBookings([...bookings, response.data]);
      setSelectedCompany(null);
      setSelectedDate(undefined);
      setIsAddBookingDialogOpen(false);
      toast.success("Booking created successfully!");
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Failed to create booking. Please try again.");
    }
  };

  const handleDeleteBooking = (booking: Booking) => {
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
      setBookings(bookings.filter(b => b._id !== bookingToDelete._id));
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
      const response = await api.put(`bookings/${editingBooking._id}`, {
        bookingDate: selectedDate.toISOString()
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBookings(bookings.map(b => b._id === editingBooking._id ? response.data : b));
      setIsEditBookingDialogOpen(false);
      toast.success('Booking updated successfully!');
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking. Please try again.');
    }
  };

  return (
    <>
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
                    <TableCell>{String(booking.user)}</TableCell>
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
    </>
  );
};

export default BookingManagement;