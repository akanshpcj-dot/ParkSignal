import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '@/components/theme-toggle';
import { logout } from '@/app/actions';
import { LogOut } from 'lucide-react';
import { DashboardNav } from '@/components/dashboard-nav';
import { Footer } from '@/components/footer';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col">
      <nav className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="shrink-0 flex items-center">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Image 
                    src="/brand/logo.png" 
                    alt="ParkSignal" 
                    width={150} 
                    height={50} 
                    className="h-12 w-auto dark:invert"
                    priority
                  />
                </Link>
              </div>
              <DashboardNav userRole={session.role} />
            </div>
            <div className="flex items-center space-x-4">
               <div className="hidden sm:flex flex-col items-end">
                 <span className="text-sm text-gray-700 dark:text-gray-200">{session.email}</span>
                 <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">{session.role || 'User'}</span>
               </div>
               <ThemeToggle />
               <form action={logout}>
                 <button type="submit" className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 transition-colors" title="Logout">
                   <LogOut className="h-5 w-5" />
                 </button>
               </form>
            </div>
          </div>
        </div>
      </nav>
      <main className="py-10 grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
