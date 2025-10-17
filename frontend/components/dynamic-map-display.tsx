// In components/dynamic-map-display.tsx

"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from './ui/skeleton';

const DynamicMapDisplay = dynamic(() => import('./map-display'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export default DynamicMapDisplay;