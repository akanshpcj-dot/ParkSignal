import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ScanLine, Phone, Clock } from 'lucide-react';
import { CarSettings } from './CarSettings';

export default async function VehicleDetailsPage({ params }: { params: Promise<{ carId: string }> }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { carId } = await params;

  // Fetch Car
  const carResult = await db.execute({
    sql: "SELECT * FROM cars WHERE id = ?",
    args: [carId],
  });

  const car = carResult.rows[0];

  if (!car) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vehicle not found</h2>
        <Link href="/dashboard/cars" className="text-blue-600 hover:underline mt-4 inline-block">
          Return to Vehicles
        </Link>
      </div>
    );
  }

  // Fetch Interactions
  const interactionsResult = await db.execute({
    sql: "SELECT * FROM interactions WHERE car_id = ? ORDER BY created_at DESC LIMIT 100",
    args: [carId],
  });

  const interactions = interactionsResult.rows;

  // Calculate Stats
  const stats = {
    scans: interactions.filter(i => i.type === 'scan').length,
    calls: interactions.filter(i => i.type === 'call').length,
    whatsapp: interactions.filter(i => i.type === 'whatsapp').length,
  };

  // If migration just happened, scan_count might be higher than logs
  // Use the max of tracked logs vs legacy counter for scans
  const displayScans = Math.max(stats.scans, (car.scan_count as number) || 0);

  const displayName = car.car_name || (car.vehicle_label as string)?.split(' - ')[0] || car.vehicle_label;
  const displayNum = car.vehicle_number || ((car.vehicle_label as string)?.includes(' - ') ? (car.vehicle_label as string).split(' - ')[1] : '');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/dashboard/cars" 
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Vehicles
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              {displayName as string}
              <span className="text-xl font-normal text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded">
                {displayNum as string}
              </span>
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Added on {new Date(car.created_at as string).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${car.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
              {car.is_active ? 'Active' : 'Disabled'}
            </span>
            <div className="ml-2 pl-2 border-l border-gray-200 dark:border-zinc-700">
                <CarSettings 
                    carId={carId} 
                    isActive={Boolean(car.is_active)} 
                    whatsappEnabled={Boolean(car.whatsapp_enabled)} 
                    isSuperAdmin={session.role === 'superadmin'}
                    isOwner={session.role === 'owner' || car.user_id === session.id}
                />
            </div>
      </div>
    </div>
  </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Scans</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{displayScans}</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
              <ScanLine className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Calls Received</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.calls}</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full">
              <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">WhatsApp Chats</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.whatsapp}</p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-full">
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 48 48">
                <path fill="#fff" d="M4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98c-0.001,0,0,0,0,0h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303z"></path>
                <path fill="#fff" d="M4.868,43.803c-0.132,0-0.26-0.052-0.355-0.148c-0.125-0.127-0.174-0.312-0.127-0.483l2.639-9.636c-1.636-2.906-2.499-6.206-2.497-9.556C4.532,13.238,13.273,4.5,24.014,4.5c5.21,0.002,10.105,2.031,13.784,5.713c3.679,3.683,5.704,8.577,5.702,13.781c-0.004,10.741-8.746,19.48-19.486,19.48c-3.189-0.001-6.344-0.788-9.144-2.277l-9.875,2.589C4.953,43.798,4.911,43.803,4.868,43.803z"></path>
                <path fill="#cfd8dc" d="M24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,4C24.014,4,24.014,4,24.014,4C12.998,4,4.032,12.962,4.027,23.979c-0.001,3.367,0.849,6.685,2.461,9.622l-2.585,9.439c-0.094,0.345,0.002,0.713,0.254,0.967c0.19,0.192,0.447,0.297,0.711,0.297c0.085,0,0.17-0.011,0.254-0.033l9.687-2.54c2.828,1.468,5.998,2.243,9.197,2.244c11.024,0,19.99-8.963,19.995-19.98c0.002-5.339-2.075-10.359-5.848-14.135C34.378,6.083,29.357,4.002,24.014,4L24.014,4z"></path>
                <path fill="#40c351" d="M35.176,12.832c-2.98-2.982-6.941-4.625-11.157-4.626c-8.704,0-15.783,7.076-15.787,15.774c-0.001,2.981,0.833,5.883,2.413,8.396l0.376,0.597l-1.595,5.821l5.973-1.566l0.577,0.342c2.422,1.438,5.2,2.198,8.032,2.199h0.006c8.698,0,15.777-7.077,15.78-15.776C39.795,19.778,38.156,15.814,35.176,12.832z"></path>
                <path fill="#fff" fillRule="evenodd" d="M19.268,16.045c-0.355-0.79-0.729-0.806-1.068-0.82c-0.277-0.012-0.593-0.011-0.909-0.011c-0.316,0-0.83,0.119-1.265,0.594c-0.435,0.475-1.661,1.622-1.661,3.956c0,2.334,1.7,4.59,1.937,4.906c0.237,0.316,3.282,5.259,8.104,7.161c4.007,1.58,4.823,1.266,5.693,1.187c0.87-0.079,2.807-1.147,3.202-2.255c0.395-1.108,0.395-2.057,0.277-2.255c-0.119-0.198-0.435-0.316-0.909-0.554s-2.807-1.385-3.242-1.543c-0.435-0.158-0.751-0.237-1.068,0.238c-0.316,0.474-1.225,1.543-1.502,1.859c-0.277,0.317-0.554,0.357-1.028,0.119c-0.474-0.238-2.002-0.738-3.815-2.354c-1.41-1.257-2.362-2.81-2.639-3.285c-0.277-0.474-0.03-0.731,0.208-0.968c0.213-0.213,0.474-0.554,0.712-0.831c0.237-0.277,0.316-0.475,0.474-0.791c0.158-0.317,0.079-0.594-0.04-0.831C20.612,19.329,19.69,16.983,19.268,16.045z" clipRule="evenodd"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">Last 100 interactions</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
            <thead className="bg-gray-50 dark:bg-zinc-800/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date & Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Location & Device
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
              {interactions.length > 0 ? (
                interactions.map((interaction) => (
                  <tr key={interaction.id as string} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${interaction.type === 'scan' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 
                          interaction.type === 'call' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                          'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                        }`}>
                        {interaction.type as string}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(interaction.created_at as string).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col gap-1">
                        {interaction.latitude && interaction.longitude ? (
                          <a 
                            href={`https://www.google.com/maps?q=${interaction.latitude},${interaction.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <ScanLine className="w-3 h-3" />
                            {Number(interaction.latitude).toFixed(5)}, {Number(interaction.longitude).toFixed(5)}
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Location N/A</span>
                        )}
                        <span className="text-xs text-gray-400">IP: {interaction.ip_address as string || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col">
                        <span>
                          {interaction.type === 'scan' ? 'QR Code Scanned' : 
                           interaction.type === 'call' ? 'Call Button Clicked' : 
                           'WhatsApp Button Clicked'}
                        </span>
                        {interaction.user_agent && (
                          <span className="text-xs text-gray-400 truncate max-w-[200px]" title={interaction.user_agent as string}>
                            {interaction.user_agent as string}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No activity recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
