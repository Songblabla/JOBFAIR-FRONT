interface Company {
    _id?: string;
    name: string;
    address: string;
    business: string;
    province: string;
    postalcode: string;
    tel?: string;
    picture: string;
  }

interface CompanyBooking {
  _id?: string;
  address: string;
  name: string;
  tel: string;
}

interface CompanyUpdate extends Pick<Company, 'name' | 'address' | 'business' | 'province' | 'postalcode' | 'tel' | 'picture'> {}