'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Skill, UserSkill } from '@/types';

interface SkillsEditorProps {
  skills_teach: UserSkill[];
  skills_learn: UserSkill[];
}

export function SkillsEditor({ skills_teach, skills_learn }: SkillsEditorProps) {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<'TEACH' | 'LEARN'>('TEACH');
  const [showAddForm, setShowAddForm] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [selectedProficiency, setSelectedProficiency] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'>('BEGINNER');
  const [useCustomSkill, setUseCustomSkill] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);

  // Fetch available skills for autocomplete
  const { data: skillsData } = useQuery({
    queryKey: ['skills'],
    queryFn: () => api.skills.getAll(),
  });

  const availableSkills = (skillsData as any)?.data || [];

  // Add skill mutation
  const addSkillMutation = useMutation({
    mutationFn: (data: {
      skill_id?: number;
      custom_skill_name?: string;
      skill_type: 'TEACH' | 'LEARN';
      proficiency_level: string;
    }) => api.skills.addToProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      setShowAddForm(false);
      setSkillInput('');
      setSelectedSkillId(null);
      setUseCustomSkill(false);
    },
  });

  // Remove skill mutation
  const removeSkillMutation = useMutation({
    mutationFn: (userSkillId: number) => api.skills.removeFromProfile(userSkillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
    },
  });

  const handleAddSkill = () => {
    if (!skillInput && !selectedSkillId) return;

    const data = {
      skill_type: selectedType,
      proficiency_level: selectedProficiency,
      ...(useCustomSkill || !selectedSkillId
        ? { custom_skill_name: skillInput }
        : { skill_id: selectedSkillId }),
    };

    addSkillMutation.mutate(data);
  };

  const displaySkills = selectedType === 'TEACH' ? skills_teach : skills_learn;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-semibold mb-4">Skills</h3>

      {/* Type Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSelectedType('TEACH')}
          className={`px-4 py-2 rounded-lg transition ${
            selectedType === 'TEACH'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          I Can Teach ({skills_teach.length})
        </button>
        <button
          onClick={() => setSelectedType('LEARN')}
          className={`px-4 py-2 rounded-lg transition ${
            selectedType === 'LEARN'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          I Want to Learn ({skills_learn.length})
        </button>
      </div>

      {/* Skills List */}
      <div className="space-y-2 mb-4">
        {displaySkills.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No skills added yet. Click "Add Skill" to get started.
          </p>
        ) : (
          displaySkills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex-1">
                <p className="font-medium">{skill.skill_name}</p>
                <p className="text-sm text-gray-600">
                  {skill.proficiency_level.charAt(0) + skill.proficiency_level.slice(1).toLowerCase()}
                  {!skill.is_predefined && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      Custom
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => removeSkillMutation.mutate(skill.id)}
                disabled={removeSkillMutation.isPending}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Skill Button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary hover:text-primary transition"
        >
          + Add Skill
        </button>
      )}

      {/* Add Skill Form */}
      {showAddForm && (
        <div className="border-2 border-primary rounded-lg p-4 space-y-3">
          {/* Skill Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skill Name
            </label>
            <input
              type="text"
              value={skillInput}
              onChange={(e) => {
                setSkillInput(e.target.value);
                // Try to find matching skill
                const match = availableSkills.find(
                  (s: Skill) => s.name.toLowerCase() === e.target.value.toLowerCase()
                );
                if (match) {
                  setSelectedSkillId(match.id);
                  setUseCustomSkill(false);
                } else {
                  setSelectedSkillId(null);
                }
              }}
              placeholder="Type skill name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {skillInput && availableSkills.some((s: Skill) =>
              s.name.toLowerCase().includes(skillInput.toLowerCase())
            ) && (
              <div className="mt-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
                {availableSkills
                  .filter((s: Skill) =>
                    s.name.toLowerCase().includes(skillInput.toLowerCase())
                  )
                  .slice(0, 5)
                  .map((skill: Skill) => (
                    <button
                      key={skill.id}
                      onClick={() => {
                        setSkillInput(skill.name);
                        setSelectedSkillId(skill.id);
                        setUseCustomSkill(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 transition"
                    >
                      {skill.name}
                      {skill.category && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({skill.category})
                        </span>
                      )}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Custom Skill Checkbox */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={useCustomSkill}
              onChange={(e) => {
                setUseCustomSkill(e.target.checked);
                if (e.target.checked) {
                  setSelectedSkillId(null);
                }
              }}
              className="rounded"
            />
            Use as custom skill (not in predefined list)
          </label>

          {/* Proficiency Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proficiency Level
            </label>
            <select
              value={selectedProficiency}
              onChange={(e) => setSelectedProficiency(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleAddSkill}
              disabled={addSkillMutation.isPending || !skillInput}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {addSkillMutation.isPending ? 'Adding...' : 'Add Skill'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setSkillInput('');
                setSelectedSkillId(null);
                setUseCustomSkill(false);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
