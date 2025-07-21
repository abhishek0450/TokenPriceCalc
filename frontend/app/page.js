'use client';

import PriceForm from '../components/PriceForm';
import PriceDisplay from '../components/PriceDisplay';
import ProgressBar from '../components/ProgressBar';

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <p className="text-center text-gray-600 dark:text-gray-400">
          Query historical cryptocurrency prices with intelligent interpolation
        </p>
      </div>

      <PriceForm />
      <PriceDisplay />
      <ProgressBar />
    </div>
  );
}
