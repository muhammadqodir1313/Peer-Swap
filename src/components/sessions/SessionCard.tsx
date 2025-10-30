'use client';

import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';

interface SessionCardProps {
  session: {
    id: string;
    title: string;
    description?: string;
    session_type: 'ONE_ON_ONE' | 'GROUP';
    scheduled_start: string;
    scheduled_end: string;
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    skill_name?: string;
    participants?: Array<{
      user: {
        id: string;
        name: string;
        avatar_url?: string;
      };
      role: 'TEACHER' | 'LEARNER';
      status: string;
    }>;
  };
  showActions?: boolean;
}

export function SessionCard({ session, showActions = true }: SessionCardProps) {
  const now = new Date();
  const start = new Date(session.scheduled_start);
  const canJoin =
    session.status === 'IN_PROGRESS' ||
    (session.status === 'SCHEDULED' &&
      start.getTime() - now.getTime() <= 10 * 60 * 1000);

  const statusColors = {
    SCHEDULED: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-green-100 text-green-700',
    COMPLETED: 'bg-gray-100 text-gray-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Link
            href={`/sessions/${session.id}`}
            className="text-lg font-semibold text-gray-900 hover:text-primary"
          >
            {session.title}
          </Link>
          {session.skill_name && (
            <p className="text-sm text-gray-600 mt-1">Skill: {session.skill_name}</p>
          )}
        </div>
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${
            statusColors[session.status]
          }`}
        >
          {session.status.replace('_', ' ')}
        </span>
      </div>

      {/* Time */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span>{formatDateTime(session.scheduled_start)}</span>
      </div>

      {/* Session Type */}
      <div className="flex items-center gap-2 mb-3">
        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
          {session.session_type === 'ONE_ON_ONE' ? '1-on-1' : 'Group'}
        </span>
        {session.participants && session.participants.length > 0 && (
          <span className="text-sm text-gray-600">
            {session.participants.length} participant
            {session.participants.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Participants Preview */}
      {session.participants && session.participants.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <div className="flex -space-x-2">
            {session.participants.slice(0, 3).map((participant) => (
              <div
                key={participant.user.id}
                className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium"
                title={participant.user.name}
              >
                {participant.user.avatar_url ? (
                  <img
                    src={participant.user.avatar_url}
                    alt={participant.user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  participant.user.name.charAt(0).toUpperCase()
                )}
              </div>
            ))}
          </div>
          {session.participants.length > 3 && (
            <span className="text-xs text-gray-500">
              +{session.participants.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2 pt-3 border-t border-gray-200">
          {canJoin && session.status !== 'CANCELLED' ? (
            <Link
              href={`/sessions/${session.id}/room`}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition text-center text-sm font-medium"
            >
              Join Session
            </Link>
          ) : (
            <Link
              href={`/sessions/${session.id}`}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-center text-sm"
            >
              View Details
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
