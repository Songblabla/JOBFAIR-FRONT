export interface Company {
    _id: string;
    name: string;
    address: string;
    business: string;
    province: string;
    postalcode: string;
    tel: string;
    picture: string;
}

export interface NewCompany {
  name: string;
  address: string;
  business: string;
  province: string;
  postalcode: string;
  tel: string;
  picture: string;
}
