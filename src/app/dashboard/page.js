'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import OverviewTab from './_components/overview-tab';
import BotsTab from './_components/bots-tab';
import AnalyticsTab from './_components/analytics-tab';
import SettingsTab from './_components/settings-tab';
import CustomizeTab from './_components/customize-tab'; // Import new tab

function DashboardContent() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  switch (currentTab) {
    case 'bots':
      return <BotsTab />;
    case 'customize':
      return <CustomizeTab />; 
    case 'analytics':
      return <AnalyticsTab />;
    case 'settings':
      return <SettingsTab />;
    default:
      return <OverviewTab />;
  }
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-muted-foreground">Preparing your dashboard</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
} 