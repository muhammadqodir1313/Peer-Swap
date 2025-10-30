'use client';

import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface MatchCardProps {
  match: {
    user: {
      id: string;
      name: string;
      avatar_url?: string;
      bio?: string;
      average_rating?: number;
    };
    match_score?: number;
    matching_skills?: Array<{
      your_skill: string;
      their_skill: string;
      similarity: number;
      you_teach: boolean;
      they_learn: boolean;
    }>;
  };
  showMatchScore?: boolean;
}

export function MatchCard({ match, showMatchScore = true }: MatchCardProps) {
  const queryClient = useQueryClient();

  const sendMatchMutation = useMutation({
    mutationFn: (userId: string) => api.matches.create(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });

  const handleSendMatch = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    sendMatchMutation.mutate(match.user.id);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Link href={`/profile/${match.user.id}`} className="flex-shrink-0">
          {match.user.avatar_url ? (
            <img
              src={match.user.avatar_url}
              alt={match.user.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
              {match.user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <Link
                href={`/profile/${match.user.id}`}
                className="font-semibold text-lg text-gray-900 hover:text-primary truncate block"
              >
                {match.user.name}
              </Link>

              {/* Rating & Match Score */}
              <div className="flex items-center gap-3 mt-1">
                {match.user.average_rating && (
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500 text-sm">⭐</span>
                    <span className="text-sm font-medium">
                      {match.user.average_rating.toFixed(1)}
                    </span>
                  </div>
                )}
                {showMatchScore && match.match_score && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    {Math.round(match.match_score * 100)}% match
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {match.user.bio && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {match.user.bio}
            </p>
          )}

          {/* Matching Skills */}
          {match.matching_skills && match.matching_skills.length > 0 && (
            <div className="mt-3 space-y-2">
              {match.matching_skills.slice(0, 2).map((skill, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="text-green-600 font-medium">
                    {skill.you_teach ? 'You teach' : 'You learn'}: {skill.your_skill}
                  </span>
                  <span className="text-gray-400">↔</span>
                  <span className="text-blue-600 font-medium">
                    {skill.they_learn ? 'They learn' : 'They teach'}: {skill.their_skill}
                  </span>
                </div>
              ))}
              {match.matching_skills.length > 2 && (
                <p className="text-sm text-gray-500">
                  +{match.matching_skills.length - 2} more matching skills
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSendMatch}
              disabled={sendMatchMutation.isPending}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-sm"
            >
              {sendMatchMutation.isPending ? 'Sending...' : 'Connect'}
            </button>
            <Link
              href={`/profile/${match.user.id}`}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              View Profile
            </Link>
          </div>

          {/* Success Message */}
          {sendMatchMutation.isSuccess && (
            <p className="text-sm text-green-600 mt-2">Match request sent!</p>
          )}
        </div>
      </div>
    </div>
  );
}
