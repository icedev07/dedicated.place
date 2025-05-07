import { NavItem } from '@/types';

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    id: 'project',
    title: 'Projects',
    url: '/dashboard/project',
    icon: 'iconListCheck',
    shortcut: ['p', 'p'],
    isActive: false,
    items: [] // No child items
  },
  {
    id: 'users',
    title: 'Users',
    url: '/dashboard/user',
    icon: 'usersGroup',
    shortcut: ['u', 'u'],
    isActive: false,
    items: [] // No child items
  },
];

export interface SaleUser {
  id: number;
  name: string;
  email: string;
  amount: string;
  image: string;
  initials: string;
}

export const recentSalesData: SaleUser[] = [
  {
    id: 1,
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    image: 'https://api.slingacademy.com/public/sample-users/1.png',
    initials: 'OM'
  },
  {
    id: 2,
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/2.png',
    initials: 'JL'
  },
  {
    id: 3,
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    image: 'https://api.slingacademy.com/public/sample-users/3.png',
    initials: 'IN'
  },
  {
    id: 4,
    name: 'William Kim',
    email: 'will@email.com',
    amount: '+$99.00',
    image: 'https://api.slingacademy.com/public/sample-users/4.png',
    initials: 'WK'
  },
  {
    id: 5,
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/5.png',
    initials: 'SD'
  }
];

export const Roles = {
  designer: 'designer',
  client: 'client',
  admin: 'admin'
};

export enum ProjectStatus {
  new = 'new',
  in_progress = 'in_progress',
  completed = 'completed'
}

export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  created_by: string;
  files?: [string];
  assigned_designer?: string;
  status: ProjectStatus;
  creator?: Profile;
  designer?: Profile;
};
