'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Power, Trash2, MessageCircle } from 'lucide-react';
import { toggleCar, deleteCar, toggleWhatsapp } from '@/app/actions';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { toast } from 'sonner';

interface CarSettingsProps {
  carId: string;
  isActive: boolean;
  whatsappEnabled: boolean;
  isSuperAdmin: boolean;
  isOwner?: boolean; // Optional to prevent breaking changes if not passed
}

export function CarSettings({ carId, isActive, whatsappEnabled, isSuperAdmin, isOwner }: CarSettingsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Allow component to render if user is Super Admin OR Owner
  if (!isSuperAdmin && !isOwner) return null;

  const handleToggleActive = async () => {
    try {
      setLoading(true);
      await toggleCar(carId, !isActive);
      toast.success(isActive ? 'QR Code disabled' : 'QR Code enabled', {
        description: `Vehicle is now ${isActive ? 'inactive' : 'active'}`
      });
    } catch (error) {
      console.error('Failed to toggle status', error);
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWhatsapp = async () => {
    try {
      setLoading(true);
      await toggleWhatsapp(carId, !whatsappEnabled);
      toast.success(whatsappEnabled ? 'WhatsApp integration disabled' : 'WhatsApp integration enabled');
    } catch (error) {
      console.error('Failed to toggle whatsapp', error);
      toast.error('Failed to update whatsapp status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteCar(carId);
      setIsDeleteModalOpen(false);
      toast.success('Vehicle deleted successfully');
      router.push('/dashboard/cars');
    } catch (error) {
      console.error('Failed to delete car', error);
      toast.error('Failed to delete car');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggleWhatsapp}
        disabled={loading}
        className={`p-2 rounded-full transition-colors ${
          whatsappEnabled 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50' 
            : 'bg-gray-100 text-gray-400 dark:bg-zinc-800 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-700'
        }`}
        title={whatsappEnabled ? "Disable WhatsApp" : "Enable WhatsApp"}
      >
        <MessageCircle className="w-5 h-5" />
      </button>

      {isSuperAdmin && (
        <>
          <button
            onClick={handleToggleActive}
            disabled={loading}
            className={`p-2 rounded-full transition-colors ${
              isActive 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50' 
                : 'bg-gray-100 text-gray-400 dark:bg-zinc-800 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-700'
            }`}
            title={isActive ? "Disable QR Code" : "Enable QR Code"}
          >
            <Power className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={loading}
            className="p-2 rounded-full bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            title="Delete Vehicle"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </>
      )}
      
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle? This action cannot be undone."
        summary="This will permanently remove the vehicle and all its associated data, including scan history."
        confirmText="Delete Vehicle"
        loading={loading}
      />
    </div>
  );
}
