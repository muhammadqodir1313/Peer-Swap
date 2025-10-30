'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { MatchCard } from '@/components/matches/MatchCard';

export default function MatchesPage() {
  const [selectedTab, setSelectedTab] = useState<'suggestions' | 'matches' | 'pending'>('suggestions');

  // Fetch AI suggestions
  const { data: suggestionsData, isLoading: loadingSuggestions } = useQuery({
    queryKey: ['matches', 'suggestions'],
    queryFn: () => api.matches.getSuggestions(20),
  });

  // Fetch current matches
  const { data: matchesData, isLoading: loadingMatches } = useQuery({
    queryKey: ['matches', 'accepted'],
    queryFn: () => api.matches.getAll({ status: 'ACCEPTED' }),
  });

  // Fetch pending requests
  const { data: pendingData, isLoading: loadingPending } = useQuery({
    queryKey: ['matches', 'pending'],
    queryFn: () => api.matches.getAll({ status: 'PENDING' }),
  });

  const suggestions = (suggestionsData as any)?.data || [];
  const matches = (matchesData as any)?.data || [];
  const pending = (pendingData as any)?.data || [];

  const isLoading = loadingSuggestions || loadingMatches || loadingPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Matches</h1>
        <p className="text-muted-foreground mt-1">
          Discover compatible learning partners powered by AI
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setSelectedTab('suggestions')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition ${
              selectedTab === 'suggestions'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Suggested for You
            {suggestions.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                {suggestions.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setSelectedTab('matches')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition ${
              selectedTab === 'matches'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Your Matches
            {matches.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                {matches.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setSelectedTab('pending')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition ${
              selectedTab === 'pending'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending Requests
            {pending.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                {pending.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading matches...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Suggestions Tab */}
              {selectedTab === 'suggestions' && (
                <>
                  {suggestions.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🤝</div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        No suggestions yet
                      </h2>
                      <p className="text-gray-600 mb-4">
                        Add skills to your profile to get personalized match suggestions
                      </p>
                      <a
                        href="/profile"
                        className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                      >
                        Update Profile
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 mb-4">
                        Based on your skills and interests, here are {suggestions.length} potential matches
                      </p>
                      {suggestions.map((match: any) => (
                        <MatchCard key={match.user.id} match={match} showMatchScore={true} />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Matches Tab */}
              {selectedTab === 'matches' && (
                <>
                  {matches.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">👥</div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        No matches yet
                      </h2>
                      <p className="text-gray-600">
                        Connect with suggested users to start learning together
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 mb-4">
                        You have {matches.length} active connection{matches.length !== 1 ? 's' : ''}
                      </p>
                      <div className="grid gap-4 md:grid-cols-2">
                        {matches.map((match: any) => (
                          <div
                            key={match.id}
                            className="bg-white rounded-lg border border-gray-200 p-4"
                          >
                            <div className="flex items-center gap-3">
                              {match.user.avatar_url ? (
                                <img
                                  src={match.user.avatar_url}
                                  alt={match.user.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                                  {match.user.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="flex-1">
                                <a
                                  href={`/profile/${match.user.id}`}
                                  className="font-medium hover:text-primary"
                                >
                                  {match.user.name}
                                </a>
                                {match.match_score && (
                                  <p className="text-sm text-gray-600">
                                    {Math.round(match.match_score * 100)}% match
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <a
                                href={`/messages/${match.user.id}`}
                                className="flex-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition text-sm text-center"
                              >
                                Message
                              </a>
                              <a
                                href={`/sessions/create?partner=${match.user.id}`}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm text-center"
                              >
                                Schedule Session
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Pending Tab */}
              {selectedTab === 'pending' && (
                <>
                  {pending.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">⏳</div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        No pending requests
                      </h2>
                      <p className="text-gray-600">
                        Pending match requests will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 mb-4">
                        You have {pending.length} pending request{pending.length !== 1 ? 's' : ''}
                      </p>
                      {pending.map((match: any) => (
                        <div
                          key={match.id}
                          className="bg-white rounded-lg border border-gray-200 p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {match.user.avatar_url ? (
                                <img
                                  src={match.user.avatar_url}
                                  alt={match.user.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                                  {match.user.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <a
                                  href={`/profile/${match.user.id}`}
                                  className="font-medium hover:text-primary"
                                >
                                  {match.user.name}
                                </a>
                                <p className="text-sm text-gray-600">
                                  Sent {new Date(match.matched_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                              Pending
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
