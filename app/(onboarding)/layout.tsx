"use client";
import { Suspense } from 'react' 


const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main>
      <Suspense fallback={<div>Loading...</div>} >
      {children}
</Suspense>
    </main>
  );
};

export default MainLayout;
