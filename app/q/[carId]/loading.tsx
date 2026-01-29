import Image from 'next/image';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white text-center">
      <div className="w-24 h-24 mb-10 relative animate-pulse">
        <Image 
            src="/brand/logo.png" 
            alt="ParkSignal" 
            width={96}
            height={96}
            className="object-contain"
            priority
        />
      </div>
      <div className="h-6 w-48 bg-gray-100 rounded animate-pulse mb-4"></div>
      <div className="h-4 w-32 bg-gray-100 rounded animate-pulse"></div>
    </div>
  );
}
