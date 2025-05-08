import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Landing from '@/components/home-page/Landing';

const HomePage = () => {
  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <Suspense fallback={<div>Loading...</div>}>
        <Landing />
      </Suspense>
      <Outlet />
    </main>
  );
};

export default HomePage;