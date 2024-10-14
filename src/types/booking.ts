interface Booking {
    _id?: string;
    bookingDate: string;
    user: string; // This is the user ID
    company: any
    createdAt?: string;
  }

  interface BookingInput {
    bookingDate: string;
    createdAt?: string;
  }