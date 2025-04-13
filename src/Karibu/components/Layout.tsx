// Karibu/components/Layout.tsx
import React from 'react';

interface LayoutProps {
  children: React.ReactNode; // Make children required since App always passes it
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#00333e] font-exo">
      {children}
    </div>
  );
}

export default Layout;