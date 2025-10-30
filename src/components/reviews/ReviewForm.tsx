'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ReviewFormProps {
  sessionId: string;
  revieweeId: string;
  revieweeName: string;
  onSuccess?: () => void;
}

export function ReviewForm({ sessionId, revieweeId, revieweeName, onSuccess }: ReviewFormProps) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createReviewMutation = useMutation({
    mutationFn: (data: { session_id: string; reviewee_id: string; rating: number; review_text?: string }) =>
      api.reviews.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || 'Failed to submit review');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    createReviewMutation.mutate({
      session_id: sessionId,
      reviewee_id: revieweeId,
      rating,
      review_text: reviewText.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <h3 className="text-lg font-semibold">Review {revieweeName}</h3>

      {/* Rating Stars */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="text-3xl transition-transform hover:scale-110"
            >
              <span
                className={
                  star <= (hoverRating || rating)
                    ? 'text-yellow-500'
                    : 'text-gray-300'
                }
              >
                ⭐
              </span>
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-sm text-gray-600 mt-1">
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
          </p>
        )}
      </div>

      {/* Review Text */}
      <div>
        <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
          Written Review (optional)
        </label>
        <textarea
          id="review"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="Share your experience with this session..."
          maxLength={2000}
        />
        <p className="text-xs text-gray-500 mt-1">
          {reviewText.length}/2000 characters
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={createReviewMutation.isPending || rating === 0}
        className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
      >
        {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
      </button>

      {/* Success Message */}
      {createReviewMutation.isSuccess && (
        <p className="text-sm text-green-600 text-center">
          Review submitted successfully!
        </p>
      )}
    </form>
  );
}
