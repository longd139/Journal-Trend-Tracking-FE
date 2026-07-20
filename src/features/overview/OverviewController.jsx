import React, { Suspense, lazy } from 'react';
import AdminOverviewPage from '../admin/AdminOverviewPage';

const GapExplorerLayout = lazy(() => import('./GapExplorerLayout'));

export default function OverviewController() {
 const currentRole = sessionStorage.getItem('userRole') || 'user';

 return (
 <div className="min-h-full bg-transparent">
  {currentRole === 'admin' ? (
  <AdminOverviewPage />
  ) : (
  <Suspense fallback={
    <div className="flex h-[calc(100vh-64px)] items-center justify-center">
      <div className="text-sm text-muted-foreground animate-pulse">Loading Research Explorer...</div>
    </div>
  }>
    <GapExplorerLayout />
  </Suspense>
  )}
 </div>
 );
}