'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { UserCard } from '@/components/search/UserCard';
import { Skill } from '@/types';

export default function SearchPage() {
  const [skillQuery, setSkillQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [skillType, setSkillType] = useState<'TEACH' | 'LEARN' | ''>('');
  const [page, setPage] = useState(1);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  // Fetch available skills for autocomplete
  const { data: skillsData } = useQuery({
    queryKey: ['skills'],
    queryFn: () => api.skills.getAll(),
  });

  const availableSkills = (skillsData as any)?.data || [];

  // Fetch search results
  const { data: searchData, isLoading } = useQuery({
    queryKey: ['users', 'search', selectedSkill, skillType, page],
    queryFn: () =>
      api.matches.search({
        skill: selectedSkill,
        type: skillType || undefined,
        page,
        limit: 20,
      }),
    enabled: !!selectedSkill,
  });

  const searchResults = (searchData as any)?.data;
  const users = searchResults?.users || [];
  const pagination = searchResults?.pagination;

  // Filter skills for autocomplete
  const filteredSkills = availableSkills.filter((skill: Skill) =>
    skill.name.toLowerCase().includes(skillQuery.toLowerCase())
  );

  const handleSearch = (skill: string) => {
    setSelectedSkill(skill);
    setSkillQuery(skill);
    setShowAutocomplete(false);
    setPage(1);
  };

  const handleSkillInputChange = (value: string) => {
    setSkillQuery(value);
    setShowAutocomplete(value.length > 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Search Users</h1>
        <p className="text-muted-foreground mt-1">
          Find people who teach or want to learn specific skills
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {/* Skill Search Input */}
          <div className="relative">
            <label htmlFor="skill" className="block text-sm font-medium text-gray-700 mb-2">
              Search by Skill
            </label>
            <div className="relative">
              <input
                type="text"
                id="skill"
                value={skillQuery}
                onChange={(e) => handleSkillInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && skillQuery) {
                    handleSearch(skillQuery);
                  }
                }}
                placeholder="Type a skill name (e.g., JavaScript, Guitar, Spanish)..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={() => handleSearch(skillQuery)}
                disabled={!skillQuery}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                Search
              </button>
            </div>

            {/* Autocomplete Dropdown */}
            {showAutocomplete && filteredSkills.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredSkills.slice(0, 10).map((skill: Skill) => (
                  <button
                    key={skill.id}
                    onClick={() => {
                      handleSearch(skill.name);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium">{skill.name}</div>
                    {skill.category && (
                      <div className="text-sm text-gray-500">{skill.category}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSkillType('')}
                className={`px-4 py-2 rounded-lg transition ${
                  skillType === ''
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSkillType('TEACH')}
                className={`px-4 py-2 rounded-lg transition ${
                  skillType === 'TEACH'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Can Teach
              </button>
              <button
                onClick={() => setSkillType('LEARN')}
                className={`px-4 py-2 rounded-lg transition ${
                  skillType === 'LEARN'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Want to Learn
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {!selectedSkill ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Start searching for skills
          </h2>
          <p className="text-gray-600">
            Type a skill name above to find people who can teach or want to learn
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Searching...</p>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No users found
          </h2>
          <p className="text-gray-600">
            Try searching for a different skill or adjust your filters
          </p>
        </div>
      ) : (
        <>
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <p className="text-gray-700">
              Found <span className="font-semibold">{pagination?.total || 0}</span> users
              {skillType && (
                <span>
                  {' '}
                  who {skillType === 'TEACH' ? 'can teach' : 'want to learn'}{' '}
                  <span className="font-semibold">{selectedSkill}</span>
                </span>
              )}
            </p>
          </div>

          {/* Results Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {users.map((user: any) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {page} of {pagination.total_pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
                disabled={page === pagination.total_pages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
