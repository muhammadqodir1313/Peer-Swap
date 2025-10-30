'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  // Fetch upcoming sessions
  const { data: sessionsData } = useQuery({
    queryKey: ['sessions', 'upcoming'],
    queryFn: () => api.sessions.getAll({ upcoming: true }),
  });

  // Fetch match suggestions
  const { data: suggestionsData } = useQuery({
    queryKey: ['matches', 'suggestions'],
    queryFn: () => api.matches.getSuggestions(5),
  });

  // Fetch unread count
  const { data: unreadData } = useQuery({
    queryKey: ['messages', 'unread'],
    queryFn: () => api.messages.getUnreadCount(),
  });

  const sessions = (sessionsData as any)?.data || [];
  const suggestions = (suggestionsData as any)?.data || [];
  const unreadCount = (unreadData as any)?.data?.total_count || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your learning journey
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Upcoming Sessions</p>
              <p className="text-2xl font-bold mt-1">{sessions.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">New Matches</p>
              <p className="text-2xl font-bold mt-1">{suggestions.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🤝</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Unread Messages</p>
              <p className="text-2xl font-bold mt-1">{unreadCount}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Upcoming Sessions</h2>
          <Link href="/sessions" className="text-primary hover:underline text-sm">
            View all
          </Link>
        </div>

        {sessions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No upcoming sessions. <Link href="/search" className="text-primary hover:underline">Find learning partners</Link>
          </p>
        ) : (
          <div className="space-y-3">
            {sessions.slice(0, 3).map((session: any) => (
              <Link
                key={session.id}
                href={`/sessions/${session.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{session.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(session.scheduled_start).toLocaleDateString()} at{' '}
                      {new Date(session.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    {session.session_type === 'ONE_ON_ONE' ? '1-on-1' : 'Group'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Match Suggestions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Suggested Matches</h2>
          <Link href="/matches" className="text-primary hover:underline text-sm">
            View all
          </Link>
        </div>

        {suggestions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Add skills to your profile to get personalized match suggestions
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {suggestions.slice(0, 4).map((match: any) => (
              <Link
                key={match.user.id}
                href={`/profile/${match.user.id}`}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                    {match.user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{match.user.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">
                        ⭐ {match.user.average_rating.toFixed(1)}
                      </span>
                      <span className="text-sm text-primary font-medium">
                        {Math.round(match.match_score * 100)}% match
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/search"
          className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition"
        >
          <h3 className="text-lg font-semibold mb-2">🔍 Search for Skills</h3>
          <p className="text-blue-100">Find people who teach what you want to learn</p>
        </Link>

        <Link
          href="/sessions/create"
          className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition"
        >
          <h3 className="text-lg font-semibold mb-2">📅 Schedule Session</h3>
          <p className="text-green-100">Book a learning session with your matches</p>
        </Link>
      </div>
    </div>
  );
}
