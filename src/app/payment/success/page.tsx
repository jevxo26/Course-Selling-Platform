import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-950">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl text-center space-y-6 border border-gray-100 dark:border-gray-800">
        <div className="flex justify-center">
          <CheckCircle className="h-20 w-20 text-green-500" />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Payment Successful!
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Thank you for your purchase. Your transaction has been completed successfully and your course is now available.
          </p>
        </div>
        <div className="pt-4">
          <Link href="/student" className="block w-full">
            <Button size="lg" className="w-full">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
