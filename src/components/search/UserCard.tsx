'use client';

import Link from 'next/link';

interface UserCardProps {
  user: {
    id: string;
    name: string;
    avatar_url?: string;
    bio?: string;
    skills?: string[];
    average_rating?: number;
  };
}

export function UserCard({ user }: UserCardProps) {
  return (
    <Link
      href={`/profile/${user.id}`}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-primary transition"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-gray-900 truncate">
            {user.name}
          </h3>

          {/* Rating */}
          {user.average_rating && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-yellow-500">⭐</span>
              <span className="text-sm font-medium">
                {user.average_rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Bio */}
          {user.bio && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {user.bio}
            </p>
          )}

          {/* Skills */}
          {user.skills && user.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {user.skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
              {user.skills.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{user.skills.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
