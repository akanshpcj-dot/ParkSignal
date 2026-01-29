import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
 
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white text-center">
      <div className="bg-gray-50 p-4 rounded-full mb-6">
        <AlertCircle className="h-10 w-10 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
      <p className="text-gray-500 mb-8">Could not find requested resource</p>
      <Link href="/" className="text-sm font-medium text-black hover:underline">
        Return Home
      </Link>
    </div>
  )
}
