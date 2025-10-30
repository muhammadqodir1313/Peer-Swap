'use client';

import Link from 'next/link';

interface ReviewCardProps {
  review: {
    id: number;
    rating: number;
    review_text?: string;
    created_at: string;
    reviewer: {
      id: string;
      name: string;
      avatar_url?: string;
    };
    session: {
      id: string;
      title: string;
      skill_name?: string;
    };
  };
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="border-b border-gray-200 pb-4 last:border-b-0">
      <div className="flex items-start gap-3">
        {/* Reviewer Avatar */}
        {review.reviewer.avatar_url ? (
          <img
            src={review.reviewer.avatar_url}
            alt={review.reviewer.name}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium flex-shrink-0">
            {review.reviewer.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Review Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
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

          {/* Review Text */}
          {review.review_text && (
            <p className="text-gray-700 mt-2">{review.review_text}</p>
          )}

          {/* Session Info */}
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
            <Link
              href={`/sessions/${review.session.id}`}
              className="hover:text-primary"
            >
              Session: {review.session.title}
            </Link>
            {review.session.skill_name && (
              <>
                <span>•</span>
                <span>{review.session.skill_name}</span>
              </>
            )}
            <span>•</span>
            <span>{new Date(review.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
