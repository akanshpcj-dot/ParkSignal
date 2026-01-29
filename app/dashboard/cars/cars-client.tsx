'use client';

import { QRGenerator } from '../../../components/qr-generator';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, X, ScanLine, Eye, EyeOff, MapPin, ArrowRight, ChevronLeft, ChevronRight, CarFront } from 'lucide-react';
import Link from 'next/link';
import { addCar } from '../../actions';
import { CarSettings } from './[carId]/CarSettings';

export interface Car {
  id: string;
  vehicle_label: string;
  car_name?: string;
  vehicle_number?: string;
  phone_number: string;
  location?: string;
  parking_slot?: string;
  whatsapp_message?: string;
  is_active: number;
  whatsapp_enabled: number;
  scan_count: number;
  created_at: string;
  user_id: string;
}

interface CarsClientProps {
  initialCars: Car[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
  search: string;
  userRole: string;
  currentUserId: string;
}

export default function CarsClient({ initialCars, pagination, search, userRole, currentUserId }: CarsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(search);
  const [visiblePhones, setVisiblePhones] = useState<Record<string, boolean>>({});
  
  // QR Generator State
  const [qrState, setQrState] = useState<{
    isOpen: boolean;
    url: string;
    label: string;
    carName: string;
    vehicleNumber: string;
    logoBase64: string | null;
  }>({
    isOpen: false,
    url: '',
    label: '',
    carName: '',
    vehicleNumber: '',
    logoBase64: null
  });

  const router = useRouter();

  // Add Car Form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    // Combine Vehicle Number parts
    const state = formData.get('state') as string;
    const rto = formData.get('rto') as string;
    const series = formData.get('series') as string;
    const number = formData.get('number') as string;
    
    const vehicleNumber = `${state} ${rto} ${series} ${number}`.trim();
    formData.set('vehicle_number', vehicleNumber);
    
    await addCar(null, formData);
    setLoading(false);
    setIsModalOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/dashboard/cars?search=${encodeURIComponent(searchTerm)}&page=1`);
  };

  const handlePageChange = (newPage: number) => {
    router.push(`/dashboard/cars?search=${encodeURIComponent(search)}&page=${newPage}`);
  };

  const togglePhoneVisibility = (id: string) => {
    setVisiblePhones(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const openQRGenerator = async (car: Car) => {
    try {
      // Fetch Logo
      let logoBase64 = null;
      try {
        const logoResponse = await fetch('/brand/logo.png');
        if (logoResponse.ok) {
          const logoBlob = await logoResponse.blob();
          logoBase64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(logoBlob);
          });
        }
      } catch (e) {
        console.error("Failed to fetch logo", e);
      }

      const displayName = car.car_name || car.vehicle_label?.split(' - ')[0] || car.vehicle_label;
      const displayNum = car.vehicle_number || (car.vehicle_label?.includes(' - ') ? car.vehicle_label.split(' - ')[1] : '');

      setQrState({
        isOpen: true,
        url: `${window.location.origin}/q/${car.id}`,
        label: car.vehicle_label,
        carName: displayName,
        vehicleNumber: displayNum,
        logoBase64
      });
    } catch (e) {
      console.error(e);
      alert('Failed to open QR generator');
    }
  };

  return (
    <div>
      {/* QR Generator Modal */}
      {qrState.isOpen && (
        <QRGenerator 
          url={qrState.url}
          label={qrState.label}
          carName={qrState.carName}
          vehicleNumber={qrState.vehicleNumber}
          logoBase64={qrState.logoBase64}
          onClose={() => setQrState(prev => ({ ...prev, isOpen: false }))}
        />
      )}

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md leading-5 bg-white dark:bg-zinc-800 dark:text-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white sm:text-sm transition duration-150 ease-in-out"
            placeholder="Search by Car Name, Vehicle Number, or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white transition-all whitespace-nowrap"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Vehicle
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-xl w-full max-w-lg relative animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Add New Vehicle</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Car Name</label>
                <input
                  name="car_name"
                  placeholder="e.g. Honda City, Toyota Fortuner"
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white px-3 py-2 shadow-sm focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle Number</label>
                <div className="grid grid-cols-4 gap-2">
                   <input
                     name="state"
                     placeholder="State (DL)"
                     className="block w-full rounded-md border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white px-3 py-2 shadow-sm focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white sm:text-sm uppercase"
                     maxLength={2}
                     required
                   />
                   <input
                     name="rto"
                     placeholder="Code (3C)"
                     className="block w-full rounded-md border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white px-3 py-2 shadow-sm focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white sm:text-sm uppercase"
                     maxLength={3}
                     required
                   />
                   <input
                     name="series"
                     placeholder="Series (AB)"
                     className="block w-full rounded-md border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white px-3 py-2 shadow-sm focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white sm:text-sm uppercase"
                     maxLength={3}
                   />
                   <input
                     name="number"
                     placeholder="Num (1234)"
                     className="block w-full rounded-md border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white px-3 py-2 shadow-sm focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white sm:text-sm"
                     maxLength={4}
                     required
                   />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Format: DL 3C AB 1234</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                <input
                  name="phone"
                  defaultValue="+91"
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white px-3 py-2 shadow-sm focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Parking Slot (Optional)</label>
                <input
                  name="parking_slot"
                  placeholder="e.g. B-12, Basement 1"
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white px-3 py-2 shadow-sm focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">WhatsApp Message</label>
                <textarea
                  name="whatsapp_message"
                  defaultValue="Hello, regarding your parked vehicle"
                  rows={2}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white px-3 py-2 shadow-sm focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white sm:text-sm resize-none"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Prefilled message for scanners.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white disabled:opacity-50 transition-all"
              >
                {loading ? 'Adding...' : 'Add Vehicle'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white dark:bg-zinc-900 shadow overflow-hidden sm:rounded-md border border-gray-100 dark:border-zinc-800">
        <ul className="divide-y divide-gray-200 dark:divide-zinc-800">
          {initialCars.map((car) => {
             // Fallback for legacy data that might not have split fields
             const displayName = car.car_name || car.vehicle_label?.split(' - ')[0] || car.vehicle_label;
             const displayNum = car.vehicle_number || (car.vehicle_label?.includes(' - ') ? car.vehicle_label.split(' - ')[1] : '');
             const displayLoc = car.parking_slot || car.location;

             return (
              <li key={car.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <Link href={`/dashboard/cars/${car.id}`} className="group flex items-center hover:underline cursor-pointer">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate mr-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {displayName}
                          {displayNum && <span className="ml-2 font-mono text-gray-500 dark:text-gray-400 text-base font-normal">[{displayNum}]</span>}
                        </h4>
                        <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-all -ml-2 group-hover:ml-0" />
                      </Link>
                      {!car.is_active && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          Disabled
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 dark:text-gray-400 mt-1 space-y-1 sm:space-y-0">
                      <span className="flex items-center cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" onClick={() => togglePhoneVisibility(car.id)} title="Click to reveal last 4 digits">
                        {visiblePhones[car.id] ? `*******${car.phone_number.slice(-4)}` : '***********'}
                        {visiblePhones[car.id] ? <Eye className="w-3.5 h-3.5 ml-2" /> : <EyeOff className="w-3.5 h-3.5 ml-2" />}
                      </span>
                      {displayLoc && (
                        <>
                          <span className="hidden sm:inline mx-2 text-gray-300 dark:text-gray-600">•</span>
                          <span className="flex items-center">
                            <MapPin className="w-3.5 h-3.5 mr-1" />
                            {displayLoc}
                          </span>
                        </>
                      )}
                    </div>
                    
                    {/* Stats & Features */}
                    <div className="flex items-center mt-2 space-x-4">
                       <div className="flex items-center text-xs text-gray-500 dark:text-gray-400" title="Total Scans">
                          <ScanLine className="w-3.5 h-3.5 mr-1" />
                          {car.scan_count || 0} scans
                       </div>
                    </div>
                    {car.created_at ? (
                      <span suppressHydrationWarning className="text-xs text-gray-400 dark:text-gray-500">
                        Added {new Date(car.created_at).toLocaleDateString()}
                      </span>
                    ) : null}
                  </div>
                  
                  <div className="flex items-center justify-end space-x-4">
                     {/* View Details */}
                     <Link 
                       href={`/dashboard/cars/${car.id}`}
                       className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                     >
                       <CarFront className="w-4 h-4" />
                       <span>View</span>
                     </Link>

                     {/* QR Downloads */}
                     <button 
                       onClick={() => openQRGenerator(car)} 
                       className="flex items-center space-x-2 px-3 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                     >
                       <ScanLine className="w-4 h-4" />
                       <span>Get QR</span>
                     </button>
                     
                     <div className="flex items-center space-x-2 pl-4 border-l border-gray-100 dark:border-zinc-800">
                       <CarSettings 
                         carId={car.id}
                         isActive={Boolean(car.is_active)}
                         whatsappEnabled={Boolean(car.whatsapp_enabled)}
                         isSuperAdmin={userRole === 'superadmin'}
                         isOwner={userRole === 'owner' || car.user_id === currentUserId}
                       />
                     </div>
                    </div>
                  </div>
              </li>
            );
          })}
          {initialCars.length === 0 && (
            <li className="px-4 py-12 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
              <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-full mb-4">
                <Search className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No vehicles found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {search ? 'Try adjusting your search terms.' : 'Get started by adding your first vehicle.'}
              </p>
            </li>
          )}
        </ul>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 sm:px-6 mt-4 rounded-lg shadow-sm">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-400">
                Showing <span className="font-medium">{(pagination.page - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(pagination.page * 10, pagination.total)}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
