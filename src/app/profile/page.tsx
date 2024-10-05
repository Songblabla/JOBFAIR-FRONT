"use client"

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { useTheme } from "next-themes"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const mockUser = {
  id: "12345",
  name: "Jane Doe",
  email: "jane.doe@example.com",
  avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Jane",
  role: "admin",
  createdAt: "2023-01-15T00:00:00.000Z"
}

const mockBookings = [
  { id: 1, companyName: "Tech Innovators Inc.", date: "2024-03-15T10:00:00.000Z", status: "Confirmed" },
  { id: 2, companyName: "Global Solutions Ltd.", date: "2024-03-17T14:00:00.000Z", status: "Pending" },
  { id: 3, companyName: "Future Systems", date: "2024-03-20T11:30:00.000Z", status: "Confirmed" },
]

const mockCompanies = [
  { id: 101, name: "Tech Innovators Inc.", industry: "Software Development" },
  { id: 102, name: "Global Solutions Ltd.", industry: "Consulting" },
  { id: 103, name: "Future Systems", industry: "AI and Machine Learning" },
  { id: 104, name: "EcoTech", industry: "Green Energy" },
  { id: 105, name: "HealthPlus", industry: "Healthcare Technology" },
  { id: 106, name: "DataDrive", industry: "Data Analytics" },
  { id: 107, name: "CyberShield", industry: "Cybersecurity" },
  { id: 108, name: "CloudNine", industry: "Cloud Computing" },
  { id: 109, name: "BioTech Innovations", industry: "Biotechnology" },
  { id: 110, name: "SmartHome Solutions", industry: "IoT" },
]

const ProfilePage = () => {
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [bookingSearchTerm, setBookingSearchTerm] = useState('')
  const [companySearchTerm, setCompanySearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const { theme } = useTheme()

  const gradientStyle = useMemo(() => {
    const hue1 = Math.floor(Math.random() * 360)
    const hue2 = (hue1 + 180) % 360 
    return {
      light: `linear-gradient(135deg, hsl(${hue1}, 70%, 85%) 0%, hsl(${hue2}, 70%, 85%) 100%)`,
      dark: `linear-gradient(135deg, hsl(${hue1}, 70%, 30%) 0%, hsl(${hue2}, 70%, 30%) 100%)`
    }
  }, [])

  const filteredBookings = useMemo(() => {
    return mockBookings
      .filter(booking => booking.companyName.toLowerCase().includes(bookingSearchTerm.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'date') return new Date(a.date) - new Date(b.date)
        return a.companyName.localeCompare(b.companyName)
      })
  }, [bookingSearchTerm, sortBy])

  const filteredCompanies = useMemo(() => {
    return mockCompanies.filter(company => 
      company.name.toLowerCase().includes(companySearchTerm.toLowerCase()) ||
      company.industry.toLowerCase().includes(companySearchTerm.toLowerCase())
    )
  }, [companySearchTerm])

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card with random gradient */}
        <Card className="lg:col-span-1 overflow-hidden" style={{ background: theme === 'dark' ? gradientStyle.dark : gradientStyle.light }}>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24 sm:w-32 sm:h-32">
                <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                <AvatarFallback>{mockUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl sm:text-2xl font-semibold">{mockUser.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">{mockUser.email}</p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-full">
                <h3 className="text-lg font-medium mb-2">Job Fair ID</h3>
                <p className="text-sm">ID: {mockUser.id}</p>
                <p className="text-sm">Role: {mockUser.role}</p>
                <p className="text-sm">Member since: {new Date(mockUser.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Console with micro navbar */}
        <Card className="lg:col-span-2 bg-gray-50 dark:bg-gray-900">
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Interview Bookings</h2>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative w-full sm:w-auto">
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
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="company">Sort by Company</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                {filteredBookings.map((booking) => (
                  <Button
                    key={booking.id}
                    variant={selectedBooking?.id === booking.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    {booking.companyName}
                  </Button>
                ))}
              </div>
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  {selectedBooking ? (
                    <div>
                      <h3 className="text-lg font-medium mb-2">{selectedBooking.companyName}</h3>
                      <p className="text-sm">Date: {new Date(selectedBooking.date).toLocaleString()}</p>
                      <p className="text-sm">Status: {selectedBooking.status}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Select a booking to view details</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {mockUser.role === 'admin' && (
        <Card className="bg-gray-50 dark:bg-gray-900">
          <CardContent className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold">Company Management</h2>
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
                  <CarouselItem key={company.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <div className="p-1">
                      <Card>
                        <CardContent className="flex flex-col items-start p-6">
                          <h3 className="text-lg font-medium mb-2">{company.name}</h3>
                          <p className="text-sm mb-4">{company.industry}</p>
                          <Button size="sm">Manage</Button>
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
  )
}

export default ProfilePage