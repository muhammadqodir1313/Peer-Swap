'use client';

import { User } from '@/types';
import Link from 'next/link';

interface ProfileCardProps {
  user: User;
  isOwnProfile?: boolean;
  showActions?: boolean;
}

export function ProfileCard({ user, isOwnProfile = false, showActions = true }: ProfileCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              {!isOwnProfile && user.email && (
                <p className="text-sm text-gray-500 mt-1">{user.email}</p>
              )}
            </div>

            {showActions && (
              <div className="flex gap-2">
                {isOwnProfile ? (
                  <Link
                    href="/profile/edit"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                  >
                    Edit Profile
                  </Link>
                ) : (
                  <>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
                      Send Match Request
                    </button>
                    <Link
                      href={`/messages/${user.id}`}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      Message
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-gray-700 mt-4 leading-relaxed">{user.bio}</p>
          )}

          {/* Stats */}
          <div className="flex gap-6 mt-4">
            <div>
              <p className="text-sm text-gray-500">Average Rating</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-yellow-500">⭐</span>
                <span className="text-lg font-semibold">
                  {user.average_rating ? user.average_rating.toFixed(1) : 'N/A'}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Total Sessions</p>
              <p className="text-lg font-semibold mt-1">{user.total_sessions || 0}</p>
            </div>

            {user.timezone && (
              <div>
                <p className="text-sm text-gray-500">Timezone</p>
                <p className="text-lg font-semibold mt-1">{user.timezone}</p>
              </div>
            )}
          </div>

          {/* Member Since */}
          <p className="text-sm text-gray-500 mt-4">
            Member since {new Date(user.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long'
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
