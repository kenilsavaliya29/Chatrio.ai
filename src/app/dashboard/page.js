'use client';

import { useSearchParams } from 'next/navigation';
import OverviewTab from './_components/overview-tab';
import BotsTab from './_components/bots-tab';
import AnalyticsTab from './_components/analytics-tab';
import SettingsTab from './_components/settings-tab';
import CustomizeTab from './_components/customize-tab';

export default function DashboardPage() {
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