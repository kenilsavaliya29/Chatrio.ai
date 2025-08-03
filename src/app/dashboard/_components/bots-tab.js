'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useAuth } from '@/context/AuthContext';
import { Bot, Loader2 } from 'lucide-react';

export default function BotsTab() {
  const { user } = useAuth();
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchBots();
  }, []);

  const fetchBots = async () => {
    try {
      const response = await fetch('/api/dashboard?tab=bots');
      const data = await response.json();
      if (response.ok) {
        setBots(data.bots);
        console.log(data.bots);
      }
    } catch (error) {
      console.error('Error fetching bots:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBotStatus = async (botId, currentStatus) => {
    setUpdating(botId);
    try {
      const response = await fetch('/api/bot/toggle-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botId,
          status: currentStatus ? 'inactive' : 'active',
        }),
      });

      console.log(response);
      
      if (response.ok) {
        fetchBots(); 
      }
    } catch (error) {
      console.error('Error toggling bot status:', error);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Your Bots</h2>
      
      <div className="space-y-3">
        {bots.length > 0 ? (
          bots.map((bot) => (
            <Card key={bot.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{bot.name}</h3>
                    <p className="text-sm text-muted-foreground">ID: {bot.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {updating === bot.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Switch
                      checked={bot.active}
                      onCheckedChange={() => toggleBotStatus(bot.id, bot.active)}
                      aria-label="Toggle bot status"
                      className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600"
                    />
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-6 col-span-full">
            <p className="text-muted-foreground text-center">No bots created yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
} 