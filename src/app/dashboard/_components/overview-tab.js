'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Bot, Activity, MessageSquare, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OverviewTab() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBots: 0,
    activeBots: 0,
    totalChats: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard?tab=overview');
      const data = await response.json();
      if (response.ok) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = [
    {
      name: 'Total Bots',
      value: stats.totalBots,
      icon: Bot,
      change: '+2 from last month',
      changeType: 'increase'
    },
    {
      name: 'Active Bots',
      value: stats.activeBots,
      icon: Activity,
      change: 'Same as last month',
      changeType: 'neutral'
    },
    {
      name: 'Total Chats',
      value: stats.totalChats.toLocaleString(),
      icon: MessageSquare,
      change: '+15% from last month',
      changeType: 'increase'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <Button onClick={() => router.push('/bot/new/basic')} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Create New Bot
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statsConfig.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                </div>
              </div>
              <p className={`mt-4 text-sm ${
                stat.changeType === 'increase' 
                  ? 'text-green-600 dark:text-green-400' 
                  : stat.changeType === 'decrease'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-muted-foreground'
              }`}>
                {stat.change}
              </p>
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
        <p className="text-muted-foreground">No recent activity to show.</p>
      </Card>
    </div>
  );
} 