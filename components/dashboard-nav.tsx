'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DashboardNavProps {
  userRole?: string;
}

export function DashboardNav({ userRole }: DashboardNavProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname.startsWith(path) 
      ? "border-black dark:border-white text-gray-900 dark:text-white"
      : "border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white";
  };

  return (
    <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
      <Link 
        href="/dashboard/cars" 
        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive('/dashboard/cars')}`}
      >
        Vehicles
      </Link>
      {userRole === 'superadmin' && (
        <Link 
          href="/dashboard/users" 
          className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive('/dashboard/users')}`}
        >
          Users
        </Link>
      )}
    </div>
  );
}
