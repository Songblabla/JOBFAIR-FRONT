import { User } from "./user";
import { Company } from "./company";

export interface Booking {
  _id: string;
  user: User;
  company: Company;
  bookingDate: string;
}
