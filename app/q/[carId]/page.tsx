import { db } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';
import InteractionButtons from './interaction-buttons';
import { logInteraction } from '@/app/actions';
import { headers } from 'next/headers';

export default async function PublicQRPage({ params }: { params: Promise<{ carId: string }> }) {
  const { carId } = await params;

  // Log scan (Server-side: captures IP/UA)
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || undefined;

  // We use logInteraction instead of direct update to ensure consistent logging
  // and to avoid double counting if logInteraction also increments the counter.
  // Note: logInteraction is async, but we don't await it to avoid blocking render (fire & forget pattern)
  logInteraction(carId, 'scan', { userAgent }).catch(err => console.error('Failed to log scan', err));

  const result = await db.execute({
    sql: "SELECT * FROM cars WHERE id = ?",
    args: [carId],
  });

  const car = result.rows[0];

  // 8️⃣ Invalid QR State
  if (!car) {
    return (
      <div className="relative min-h-screen bg-white flex flex-col items-center px-4 pt-8 text-center">
        <Image 
          src="/brand/parksignal-logo.png" 
          alt="ParkSignal" 
          width={150}
          height={32}
          className="h-18 w-auto mb-6 brightness-0" 
        />
        <p className="text-gray-700 text-base font-medium mt-20">
          This QR code is no longer valid.
        </p>
      </div>
    );
  }

  // 7️⃣ Disabled / Inactive QR State
  if (!car.is_active) {
    return (
      <div className="relative min-h-screen bg-white flex flex-col items-center px-4 pt-8 text-center">
        <Image 
          src="/brand/logo.png" 
          alt="ParkSignal" 
          width={150}
          height={50}
          className="h-12 w-auto mb-6 brightness-0" 
        />
        <p className="text-gray-700 text-base font-medium mt-20">
          This vehicle contact is currently unavailable.
        </p>
      </div>
    );
  }

  const whatsappEnabled = !!car.whatsapp_enabled;
  const whatsappMessage = (car.whatsapp_message as string) || 'Hello, regarding your parked vehicle';
  
  // Logic to get the display number
  const displayNum = (car.vehicle_number as string) || 
    ((car.vehicle_label as string)?.includes(' - ') ? (car.vehicle_label as string).split(' - ')[1] : (car.vehicle_label as string)) ||
    'Vehicle';

  return (
    // 1️⃣ Page Container (Base Layout) - Forced Light Mode
    <div className="relative min-h-screen bg-white flex flex-col items-center px-4 pt-8 text-center">
      
      {/* 2️⃣ Logo (Trust Anchor) */}
      <Image 
        src="/brand/parksignal-logo.png" 
        alt="ParkSignal" 
        width={600}
        height={180}
        className="h-56 w-auto mb-10" 
        priority
      />

      {/* 3️⃣ Primary Message (Clarity Text) */}
      <p className="text-gray-900 text-lg font-bold mb-8">
        {displayNum} owner can be contacted
      </p>

      {/* 4️⃣ & 5️⃣ Interaction Buttons (Call & WhatsApp) */}
      <InteractionButtons 
        carId={carId}
        phoneNumber={car.phone_number as string}
        whatsappEnabled={whatsappEnabled}
        whatsappMessage={whatsappMessage}
      />

      {/* 6️⃣ Micro Trust Line (Anxiety Reducer) */}
      <p className="text-xs text-gray-500 mt-2">
        🔒 No app • No login • Direct contact only
      </p>

      <div className="mt-6 text-xs text-gray-400">
        <Link href="/safety" className="underline">
          Safety Notice
        </Link>
      </div>
    </div>
  );
}
