'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { AvatarUpload } from '@/components/profile/AvatarUpload';

export default function EditProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch current profile
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => api.users.getMe(),
  });

  const profile = (profileData as any)?.data;

  // Form state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [timezone, setTimezone] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Initialize form with current data
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setBio(profile.bio || '');
      setTimezone(profile.timezone || '');
    }
  }, [profile]);

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: (data: { name?: string; bio?: string; timezone?: string }) =>
      api.users.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      router.push('/profile');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || 'Failed to update profile');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (bio.length > 1000) {
      setError('Bio must be less than 1000 characters');
      return;
    }

    updateMutation.mutate({
      name: name.trim(),
      bio: bio.trim() || undefined,
      timezone: timezone || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Edit Profile</h1>
        <p className="text-muted-foreground mt-1">
          Update your profile information
        </p>
      </div>

      {/* Avatar Upload */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Profile Picture</h2>
        <AvatarUpload currentAvatar={profile.avatar_url} userName={profile.name} />
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold mb-4">Profile Information</h2>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Your full name"
            required
            minLength={2}
            maxLength={255}
          />
          <p className="text-sm text-gray-500 mt-1">
            This is how other users will see you
          </p>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="Tell others about yourself, your interests, and what you'd like to learn or teach..."
            maxLength={1000}
          />
          <p className="text-sm text-gray-500 mt-1">
            {bio.length}/1000 characters
          </p>
        </div>

        {/* Timezone */}
        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
            Timezone
          </label>
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select timezone...</option>
            <option value="America/New_York">Eastern Time (US)</option>
            <option value="America/Chicago">Central Time (US)</option>
            <option value="America/Denver">Mountain Time (US)</option>
            <option value="America/Los_Angeles">Pacific Time (US)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Paris">Paris (CET)</option>
            <option value="Europe/Moscow">Moscow (MSK)</option>
            <option value="Asia/Dubai">Dubai (GST)</option>
            <option value="Asia/Kolkata">India (IST)</option>
            <option value="Asia/Shanghai">China (CST)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
            <option value="Australia/Sydney">Sydney (AEDT)</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Helps others know when you're available
          </p>
        </div>

        {/* Email (Read-only) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={profile.email}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
          />
          <p className="text-sm text-gray-500 mt-1">
            Email cannot be changed
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/profile')}
            disabled={updateMutation.isPending}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:cursor-not-allowed transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
