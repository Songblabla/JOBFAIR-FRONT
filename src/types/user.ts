export interface User {
    _id?: string;
    name: string;
    email: string;
    tel: string;
    role: 'user' | 'admin';
}