'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { useParams } from 'next/navigation';

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;

  // Fetch user profile
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['users', userId],
    queryFn: () => api.users.getById(userId),
  });

  // Fetch reviews
  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', userId],
    queryFn: () => api.reviews.getForUser(userId),
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
        <div className="text-center">
          <p className="text-gray-500 text-lg">User not found</p>
          <p className="text-gray-400 text-sm mt-2">
            This user may have deleted their account
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <ProfileCard user={profile} isOwnProfile={false} showActions={true} />

      {/* Skills Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Teaching Skills */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4">Can Teach</h3>
          {!profile.skills_teach || profile.skills_teach.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No teaching skills listed
            </p>
          ) : (
            <div className="space-y-2">
              {profile.skills_teach.map((skill: any) => (
                <div
                  key={skill.id}
                  className="p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <p className="font-medium text-green-900">{skill.skill_name}</p>
                  <p className="text-sm text-green-700">
                    {skill.proficiency_level.charAt(0) +
                      skill.proficiency_level.slice(1).toLowerCase()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Learning Skills */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4">Wants to Learn</h3>
          {!profile.skills_learn || profile.skills_learn.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No learning interests listed
            </p>
          ) : (
            <div className="space-y-2">
              {profile.skills_learn.map((skill: any) => (
                <div
                  key={skill.id}
                  className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <p className="font-medium text-blue-900">{skill.skill_name}</p>
                  <p className="text-sm text-blue-700">
                    {skill.proficiency_level.charAt(0) +
                      skill.proficiency_level.slice(1).toLowerCase()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
            No reviews yet
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
                      <p className="font-medium">{review.reviewer.name}</p>
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
