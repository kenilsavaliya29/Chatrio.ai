'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext';
import { Bot, Loader2, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CustomizeTab() {
  const router = useRouter();
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBots() {
      try {
        const response = await fetch('/api/dashboard?tab=bots');
        if (response.ok) {
          const data = await response.json();
          setBots(data.bots);
        }
      } catch (error) {
        console.error('Error fetching bots:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBots();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Customize a Bot</h2>
      <p className="text-muted-foreground">Select a bot to edit its appearance and behavior.</p>
      
      <div className="space-y-3">
        {bots.length > 0 ? (
          bots.map((bot) => (
            <Card key={bot.id} className="p-4 group transition-colors hover:bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{bot.name}</h3>
                    <p className="text-xs text-muted-foreground">ID: {bot.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => router.push(`/dashboard/customize/${bot.id}`)}
                  className="p-2 px-4 rounded-md bg-primary text-background font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out"
                >
                  Customize
                </button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-6 col-span-full">
            <p className="text-muted-foreground text-center">You have no bots to customize. Create one first!</p>
          </Card>
        )}
      </div>
    </div>
  );
} 