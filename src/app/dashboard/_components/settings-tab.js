'use client';

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertDialog } from '@/components/ui/AlertDialog';


export default function SettingsTab() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const handleNameChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/user/update-name', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Name updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update name.' });
      }
    } catch (error) {
      console.error('Error updating name:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsModalOpen(true); 
  };

  const confirmDeleteAccount = async () => {
    setIsModalOpen(false); // Close modal
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Account deleted successfully!' });
        // Redirect to login or home page after deletion
        router.push('/login'); 
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete account.' });
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setMessage({ type: 'error', text: 'Failed to delete account.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Settings</h2>

      {message.text && (
        <div className={`p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Profile Settings</h3>
        <form onSubmit={handleNameChange} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full"
              disabled={loading}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Update Name'}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Account Management</h3>
        <Button variant="destructive" onClick={handleDeleteAccount} disabled={loading}>
          {loading ? 'Deleting...' : 'Delete Account'}
        </Button>
      </Card>

      <AlertDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDeleteAccount}
        title="Confirm Account Deletion"
        message="Are you sure you want to delete your account? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
} 