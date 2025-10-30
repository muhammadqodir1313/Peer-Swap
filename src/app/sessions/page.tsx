'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { SessionCard } from '@/components/sessions/SessionCard';
import Link from 'next/link';

type TabType = 'upcoming' | 'past' | 'cancelled';

export default function SessionsPage() {
  const [selectedTab, setSelectedTab] = useState<TabType>('upcoming');

  // Fetch sessions
  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ['sessions', selectedTab],
    queryFn: () => {
      if (selectedTab === 'upcoming') {
        return api.sessions.getAll({ upcoming: true });
      } else if (selectedTab === 'past') {
        return api.sessions.getAll({ past: true });
      } else {
        return api.sessions.getAll({ status: 'CANCELLED' });
      }
    },
  });

  const sessions = (sessionsData as any)?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sessions</h1>
          <p className="text-muted-foreground mt-1">
            Manage your learning sessions
          </p>
        </div>
        <Link
          href="/sessions/create"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
        >
          Create Session
        </Link>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setSelectedTab('upcoming')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition ${
              selectedTab === 'upcoming'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setSelectedTab('past')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition ${
              selectedTab === 'past'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Past
          </button>
          <button
            onClick={() => setSelectedTab('cancelled')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition ${
              selectedTab === 'cancelled'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Cancelled
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading sessions...</p>
              </div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                {selectedTab === 'upcoming' && '📅'}
                {selectedTab === 'past' && '📚'}
                {selectedTab === 'cancelled' && '🚫'}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {selectedTab === 'upcoming' && 'No upcoming sessions'}
                {selectedTab === 'past' && 'No past sessions'}
                {selectedTab === 'cancelled' && 'No cancelled sessions'}
              </h2>
              <p className="text-gray-600 mb-4">
                {selectedTab === 'upcoming'
                  ? 'Schedule a new session to get started'
                  : selectedTab === 'past'
                  ? 'Complete some sessions to see them here'
                  : 'Cancelled sessions will appear here'}
              </p>
              {selectedTab === 'upcoming' && (
                <Link
                  href="/sessions/create"
                  className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                >
                  Create Session
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {sessions.map((session: any) => (
                <SessionCard key={session.id} session={session} showActions={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
