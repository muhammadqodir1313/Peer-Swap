'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';

export default function SessionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const sessionId = params.sessionId as string;

  // Fetch session details
  const { data: sessionData, isLoading } = useQuery({
    queryKey: ['sessions', sessionId],
    queryFn: () => api.sessions.getById(sessionId),
  });

  // Cancel session mutation
  const cancelMutation = useMutation({
    mutationFn: () => api.sessions.cancel(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  const session = (sessionData as any)?.data;

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Session not found</p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const start = new Date(session.scheduled_start);
  const canJoin =
    session.status === 'IN_PROGRESS' ||
    (session.status === 'SCHEDULED' && start.getTime() - now.getTime() <= 10 * 60 * 1000);
  const isCreator = session.created_by === user?.id;
  const canCancel = isCreator && session.status === 'SCHEDULED';

  const statusColors = {
    SCHEDULED: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-green-100 text-green-700',
    COMPLETED: 'bg-gray-100 text-gray-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this session?')) {
      cancelMutation.mutate();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{session.title}</h1>
          <span
            className={`inline-block mt-2 px-3 py-1 text-sm font-medium rounded-full ${
              statusColors[session.status]
            }`}
          >
            {session.status.replace('_', ' ')}
          </span>
        </div>
        {canJoin && (
          <Link
            href={`/sessions/${sessionId}/room`}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium"
          >
            Join Session
          </Link>
        )}
      </div>

      {/* Session Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Session Details</h2>

        <div className="space-y-3">
          {/* Time */}
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="font-medium">Start: {formatDateTime(session.scheduled_start)}</p>
              <p className="font-medium">End: {formatDateTime(session.scheduled_end)}</p>
            </div>
          </div>

          {/* Type */}
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{session.session_type === 'ONE_ON_ONE' ? 'One-on-One' : 'Group'} Session</span>
          </div>

          {/* Skill */}
          {session.skill_name && (
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Skill: {session.skill_name}</span>
            </div>
          )}

          {/* Description */}
          {session.description && (
            <div className="pt-2 border-t border-gray-200">
              <p className="text-gray-700">{session.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Participants */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">
          Participants ({session.participants?.length || 0})
        </h2>

        <div className="space-y-3">
          {session.participants?.map((participant: any) => (
            <div key={participant.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                {participant.user.avatar_url ? (
                  <img
                    src={participant.user.avatar_url}
                    alt={participant.user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    {participant.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <Link
                    href={`/profile/${participant.user.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {participant.user.name}
                  </Link>
                  <p className="text-sm text-gray-600">
                    {participant.role === 'TEACHER' ? 'Teacher' : 'Learner'}
                    {participant.user.id === session.created_by && ' (Host)'}
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 text-xs rounded-full ${
                  participant.status === 'ACCEPTED'
                    ? 'bg-green-100 text-green-700'
                    : participant.status === 'DECLINED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {participant.status.charAt(0) + participant.status.slice(1).toLowerCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {canCancel && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <button
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Session'}
          </button>
          {cancelMutation.isSuccess && (
            <p className="text-sm text-green-600 mt-2">Session cancelled successfully</p>
          )}
        </div>
      )}

      {/* Back Button */}
      <div>
        <Link
          href="/sessions"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Sessions
        </Link>
      </div>
    </div>
  );
}
