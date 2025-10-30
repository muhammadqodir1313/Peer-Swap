'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function CreateSessionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillId, setSkillId] = useState<number | null>(null);
  const [customSkill, setCustomSkill] = useState('');
  const [sessionType, setSessionType] = useState<'ONE_ON_ONE' | 'GROUP'>('ONE_ON_ONE');
  const [scheduledStart, setScheduledStart] = useState('');
  const [scheduledEnd, setScheduledEnd] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<
    Array<{ user_id: string; role: 'TEACHER' | 'LEARNER' }>
  >([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch skills
  const { data: skillsData } = useQuery({
    queryKey: ['skills'],
    queryFn: () => api.skills.getAll(),
  });

  // Fetch matches for participant selection
  const { data: matchesData } = useQuery({
    queryKey: ['matches', 'accepted'],
    queryFn: () => api.matches.getAll({ status: 'ACCEPTED' }),
  });

  const skills = (skillsData as any)?.data || [];
  const matches = (matchesData as any)?.data || [];

  // Create session mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => api.sessions.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      const sessionId = (response as any)?.data?.id;
      router.push(`/sessions/${sessionId}`);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || 'Failed to create session');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!scheduledStart || !scheduledEnd) {
      setError('Start and end times are required');
      return;
    }

    const start = new Date(scheduledStart);
    const end = new Date(scheduledEnd);
    const now = new Date();

    if (start <= now) {
      setError('Start time must be in the future');
      return;
    }

    if (end <= start) {
      setError('End time must be after start time');
      return;
    }

    if (sessionType === 'ONE_ON_ONE' && selectedParticipants.length !== 1) {
      setError('One-on-one sessions require exactly 1 other participant');
      return;
    }

    if (sessionType === 'GROUP' && (selectedParticipants.length < 1 || selectedParticipants.length > 3)) {
      setError('Group sessions require 1-3 other participants');
      return;
    }

    const data = {
      title: title.trim(),
      description: description.trim() || undefined,
      ...(skillId ? { skill_id: skillId } : customSkill ? { custom_skill_name: customSkill } : {}),
      session_type: sessionType,
      scheduled_start: start.toISOString(),
      scheduled_end: end.toISOString(),
      participants: selectedParticipants,
    };

    createMutation.mutate(data);
  };

  const toggleParticipant = (userId: string, role: 'TEACHER' | 'LEARNER') => {
    const exists = selectedParticipants.find((p) => p.user_id === userId);
    if (exists) {
      setSelectedParticipants(selectedParticipants.filter((p) => p.user_id !== userId));
    } else {
      setSelectedParticipants([...selectedParticipants, { user_id: userId, role }]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Create Session</h1>
        <p className="text-muted-foreground mt-1">
          Schedule a new learning session
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Session Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g., JavaScript Basics: Variables and Functions"
            required
            maxLength={255}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="What will you cover in this session?"
            maxLength={2000}
          />
        </div>

        {/* Skill */}
        <div>
          <label htmlFor="skill" className="block text-sm font-medium text-gray-700 mb-1">
            Skill (optional)
          </label>
          <select
            id="skill"
            value={skillId || ''}
            onChange={(e) => {
              setSkillId(e.target.value ? Number(e.target.value) : null);
              setCustomSkill('');
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select a skill...</option>
            {skills.map((skill: any) => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">Or enter custom skill:</p>
          <input
            type="text"
            value={customSkill}
            onChange={(e) => {
              setCustomSkill(e.target.value);
              setSkillId(null);
            }}
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Custom skill name"
            maxLength={100}
          />
        </div>

        {/* Session Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Type <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="ONE_ON_ONE"
                checked={sessionType === 'ONE_ON_ONE'}
                onChange={(e) => setSessionType(e.target.value as any)}
                className="w-4 h-4"
              />
              <span>One-on-One (2 people)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="GROUP"
                checked={sessionType === 'GROUP'}
                onChange={(e) => setSessionType(e.target.value as any)}
                className="w-4 h-4"
              />
              <span>Group (2-4 people)</span>
            </label>
          </div>
        </div>

        {/* Schedule */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="start" className="block text-sm font-medium text-gray-700 mb-1">
              Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="start"
              value={scheduledStart}
              onChange={(e) => setScheduledStart(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="end" className="block text-sm font-medium text-gray-700 mb-1">
              End Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="end"
              value={scheduledEnd}
              onChange={(e) => setScheduledEnd(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>

        {/* Participants */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Invite Participants <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-600 mb-3">
            {sessionType === 'ONE_ON_ONE'
              ? 'Select 1 participant for a one-on-one session'
              : 'Select 1-3 participants for a group session'}
          </p>

          {matches.length === 0 ? (
            <p className="text-gray-500 text-center py-4 border border-dashed border-gray-300 rounded-lg">
              No matches yet. Connect with users first.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {matches.map((match: any) => {
                const isSelected = selectedParticipants.some((p) => p.user_id === match.user.id);
                const participant = selectedParticipants.find((p) => p.user_id === match.user.id);

                return (
                  <div
                    key={match.user.id}
                    className={`p-3 rounded-lg border transition ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleParticipant(match.user.id, 'LEARNER')}
                          className="w-4 h-4"
                        />
                        <span className="font-medium">{match.user.name}</span>
                      </div>
                      {isSelected && (
                        <select
                          value={participant?.role || 'LEARNER'}
                          onChange={(e) => {
                            setSelectedParticipants(
                              selectedParticipants.map((p) =>
                                p.user_id === match.user.id
                                  ? { ...p, role: e.target.value as 'TEACHER' | 'LEARNER' }
                                  : p
                              )
                            );
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="TEACHER">Teacher</option>
                          <option value="LEARNER">Learner</option>
                        </select>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
            disabled={createMutation.isPending}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {createMutation.isPending ? 'Creating...' : 'Create Session'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/sessions')}
            disabled={createMutation.isPending}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:cursor-not-allowed transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
