interface Booking {
    _id?: string;
    bookingDate: string;
    user: string; // This is the user ID
    company: string; // This is the company ID
    createdAt?: string;
  }

  interface BookingInput {
    bookingDate: string;
    createdAt?: string;
  }