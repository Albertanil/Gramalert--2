// components/dynamic-map-picker.tsx

"use client";

import dynamic from 'next/dynamic';

// Use next/dynamic to create a new component that disables SSR
const DynamicMapPicker = dynamic(() => import('./map-picker'), {
  ssr: false, // This is the key part
  loading: () => <p>Loading map...</p> // Optional: a loading component
});

export default DynamicMapPicker;