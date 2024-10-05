interface User {
    _id?: string;
    name: string;
    email: string;
    tel: string;
    role?: 'admin' | 'user';
    password: string;
    createdAt?: string;
  }