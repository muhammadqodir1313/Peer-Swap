// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  timezone?: string;
  created_at: string;
  skills_teach?: UserSkill[];
  skills_learn?: UserSkill[];
  average_rating?: number;
  total_sessions?: number;
}

export interface UserSkill {
  id: number;
  skill_name: string;
  is_predefined: boolean;
  proficiency_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
}

// Skill types
export interface Skill {
  id: number;
  name: string;
  category?: string;
}

// Match types
export interface MatchSuggestion {
  user: {
    id: string;
    name: string;
    avatar_url?: string;
    bio?: string;
    average_rating: number;
  };
  match_score: number;
  matching_skills: MatchingSkill[];
}

export interface MatchingSkill {
  your_skill: string;
  their_skill: string;
  similarity: number;
  you_teach: boolean;
  they_learn: boolean;
}

export interface Match {
  match_id: number;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED';
  matched_at: string;
  user_id: string;
  name: string;
  avatar_url?: string;
  bio?: string;
}

// Session types
export interface Session {
  id: string;
  title: string;
  description?: string;
  skill_name?: string;
  session_type: 'ONE_ON_ONE' | 'GROUP';
  scheduled_start: string;
  scheduled_end: string;
  actual_start?: string;
  actual_end?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  webrtc_room_id?: string;
  created_by: string;
  created_at: string;
  participants?: SessionParticipant[];
}

export interface SessionParticipant {
  id: number;
  role: 'TEACHER' | 'LEARNER';
  status: 'INVITED' | 'ACCEPTED' | 'DECLINED' | 'JOINED' | 'LEFT';
  joined_at?: string;
  left_at?: string;
  user_id: string;
  name: string;
  avatar_url?: string;
}

// Message types
export interface Message {
  id: number;
  sender_id: string;
  recipient_id?: string;
  session_id?: string;
  message_type: 'DIRECT' | 'SESSION';
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  user_id: string;
  name: string;
  avatar_url?: string;
  last_message_content: string;
  last_message_at: string;
  is_read: boolean;
  unread_count: number;
}

// Review types
export interface Review {
  id: number;
  reviewer: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  rating: number;
  review_text?: string;
  session: {
    id: string;
    title: string;
    skill_name?: string;
  };
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
