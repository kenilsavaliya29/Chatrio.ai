'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bot, Loader2, Trash } from 'lucide-react';
import { AlertDialog } from '@/components/ui/AlertDialog';

export default function BotsTab() {

  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [botToDelete, setBotToDelete] = useState(null);
  const [confirmName, setConfirmName] = useState('');


  useEffect(() => {
    fetchBots();
  }, []);

  const fetchBots = async () => {
    try {
      const response = await fetch('/api/dashboard?tab=bots');
      const data = await response.json();
      if (response.ok) {
        setBots(data.bots);
        // console.log(data.bots);
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

  const handleDeleteClick = (bot) => {
    setBotToDelete(bot);
    setConfirmName('');
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    await deleteBot(botToDelete.id);
    setModalOpen(false);
    setBotToDelete(null);
    setConfirmName('');
    fetchBots();
  };

  const deleteBot = async (botId) => {
    try {
      const response = await fetch('/api/bot/delete-bot', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botId,
        }),
      });
      const data = await response.json();
      console.log(data);
    } catch (e) {
      console.log(`Error occured while deleting the bot{e}`);
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
                    <>
                      <Switch
                        checked={bot.active}
                        onCheckedChange={() => toggleBotStatus(bot.id, bot.active)}
                        aria-label="Toggle bot status"
                        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600"
                      />

                      <button
                        onClick={() => handleDeleteClick(bot)}
                        className=" text-red-500 hover:text-red-700 p-2.5 hover:bg-red-500/20 rounded-full"
                        aria-label="Delete bot"
                      >
                        <Trash className="w-5 h-5" />
                      </button>

                    </>
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
      {/* Modal for delete confirmation */}
      <AlertDialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Bot"
        message={
          <div>
            <p className="mb-2 text-red-600 font-semibold">This action cannot be undone. This will permanently delete the bot and it cannot be recovered.</p>
            <span className="mb-2">Please type <span className="font-bold">{botToDelete?.name}</span> to confirm deletion.</span>
            <input
              type="text"
              className="w-full border rounded px-2 py-1 mt-2"
              placeholder="Type bot name to confirm"
              value={confirmName}
              onChange={e => setConfirmName(e.target.value)}
            />
          </div>
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmDisabled={confirmName !== botToDelete?.name}
      />
    </div>
  );
} 