import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="relative flex grow flex-col items-center justify-center p-8 bg-background text-center">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="flex flex-col items-center max-w-lg mx-auto space-y-8">
          <Image
            src="/brand/logo.png"
            alt="ParkSignal Logo"
            width={240}
            height={80}
            priority
            className="mb-4 w-60 h-auto dark:invert"
          />
          
          <div className="space-y-4">
            <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">
              Scan to call vehicle owner.
              <br />
              <span className="text-gray-400 dark:text-gray-500 text-lg">Privacy-first contact system.</span>
            </p>
          </div>

          <div className="pt-12 border-t border-gray-100 dark:border-gray-800 w-full">
             <Link href="/login" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
               Login &rarr;
             </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
