import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} ParkSignal. All rights reserved.
          </div>
          
          <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms of Use</Link>
            <Link href="/safety" className="hover:text-gray-900 dark:hover:text-white transition-colors">Safety Notices</Link>
          </div>

          <div className="text-xs text-gray-400 dark:text-gray-500 font-mono">
            Developed by <span className="text-gray-600 dark:text-gray-300 font-medium">Akansh Gautam</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
