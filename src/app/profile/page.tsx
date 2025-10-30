'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { SkillsEditor } from '@/components/profile/SkillsEditor';
import Link from 'next/link';

export default function ProfilePage() {
  const { user } = useAuth();

  // Fetch full profile data
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => api.users.getMe(),
  });

  // Fetch reviews
  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', user?.id],
    queryFn: () => api.reviews.getForUser(user?.id || ''),
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const profile = (profileData as any)?.data;
  const reviews = (reviewsData as any)?.data?.reviews || [];
  const averageRating = (reviewsData as any)?.data?.average_rating;
  const totalReviews = (reviewsData as any)?.data?.total_reviews || 0;

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Link
          href="/profile/edit"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
        >
          Edit Profile
        </Link>
      </div>

      {/* Profile Card */}
      <ProfileCard user={profile} isOwnProfile={true} showActions={false} />

      {/* Skills Editor */}
      <SkillsEditor
        skills_teach={profile.skills_teach || []}
        skills_learn={profile.skills_learn || []}
      />

      {/* Reviews Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Reviews</h3>
          {averageRating && (
            <div className="flex items-center gap-2">
              <span className="text-yellow-500 text-2xl">⭐</span>
              <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
              <span className="text-gray-500">({totalReviews} reviews)</span>
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No reviews yet. Complete some sessions to receive reviews!
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.slice(0, 5).map((review: any) => (
              <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                    {review.reviewer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/profile/${review.reviewer.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {review.reviewer.name}
                      </Link>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>
                    {review.review_text && (
                      <p className="text-gray-700 mt-2">{review.review_text}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                      <span>Session: {review.session.title}</span>
                      <span>•</span>
                      <span>{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {totalReviews > 5 && (
              <button className="w-full py-2 text-primary hover:underline">
                View all {totalReviews} reviews
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
