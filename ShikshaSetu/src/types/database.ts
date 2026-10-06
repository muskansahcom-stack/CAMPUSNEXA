export type UserRole = 'student' | 'teacher' | 'school_admin';

export type ConnectivityLevel = 'offline' | 'intermittent_2g' | '3g' | '4g';
export type DeviceAccess = 'shared_phone' | 'dedicated_phone' | 'tablet' | 'desktop';

export interface SchoolRow {
  id: string;
  name: string;
  region: string | null;
  state: string;
  district: string;
  address: string | null;
  created_at: string;
}

export interface ProfileRow {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  preferred_language: string;
  avatar_url: string | null;
  school_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentProfileRow {
  id: string;
  profile_id: string;
  grade: number;
  class_name: string | null;
  learning_level: string;
  device_access: string;
  connectivity_level: string;
  created_at: string;
}

export interface TeacherProfileRow {
  id: string;
  profile_id: string;
  school_id: string | null;
  employee_id: string | null;
  subjects: string[];
  created_at: string;
}

export interface ClassRow {
  id: string;
  school_id: string;
  name: string;
  grade: number;
  section: string | null;
  teacher_id: string | null;
  created_at: string;
}

export interface ClassStudentRow {
  class_id: string;
  student_id: string;
}

export interface SubjectRow {
  id: string;
  name: string;
  description: string | null;
  language: string;
  created_at: string;
}

export interface StudentLearningStatsRow {
  profile_id: string;
  streak_days: number;
  xp_points: number;
  daily_goal_minutes: number;
  today_completed_minutes: number;
  overall_progress_pct: number;
  current_level_title: string;
  updated_at?: string;
}

export interface StudentJourneyNodeRow {
  id: string;
  subject: string;
  title: string;
  order_index: number;
  status: 'completed' | 'in_progress' | 'locked';
  estimated_mins: number;
  badge_label?: string;
}

export interface StudentAchievementRow {
  id: string;
  profile_id: string;
  badge_code: string;
  title: string;
  description: string;
  icon: string;
  unlocked_at: string;
}

export interface StudentRecentActivityRow {
  id: string;
  profile_id: string;
  title: string;
  subject: string;
  activity_type: 'quiz' | 'lesson' | 'audio' | 'download';
  xp_earned: number;
  created_at: string;
}

export interface StudentActiveLessonRow {
  profile_id: string;
  title: string;
  subject: string;
  topic: string;
  progress_pct: number;
  estimated_remaining_mins: number;
  next_action_label: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  hint?: string;
}

export interface TopicRow {
  id: string;
  subject_id: string;
  name: string;
  description: string | null;
  difficulty: number;
  prerequisite_topic_id: string | null;
  created_at?: string;
}

export interface QuestionRow {
  id: string;
  topic_id: string;
  question: string;
  options: QuestionOption[];
  correct_answer: string;
  explanation: string;
  difficulty: number;
  created_at?: string;
}

export interface AssessmentRow {
  id: string;
  student_id: string;
  subject_id: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  score: number;
  started_at: string;
  completed_at: string | null;
}

export interface AssessmentAnswerRow {
  id: string;
  assessment_id: string;
  question_id: string;
  answer: string;
  is_correct: boolean;
  response_time: number;
  created_at?: string;
}

export interface StudentMasteryRow {
  id: string;
  student_id: string;
  topic_id: string;
  mastery_score: number;
  attempts: number;
  correct_attempts: number;
  last_attempted_at: string;
}

export interface LearningPathRow {
  id: string;
  student_id: string;
  subject_id: string;
  generated_at: string;
}

export interface LearningPathItemRow {
  id: string;
  learning_path_id: string;
  topic_id: string;
  sequence: number;
  status: 'not_started' | 'in_progress' | 'mastered' | 'needs_practice';
  created_at?: string;
}

export interface Database {
  public: {
    Tables: {
      schools: {
        Row: SchoolRow;
        Insert: Omit<SchoolRow, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<SchoolRow, 'id'>>;
      };
      profiles: {
        Row: ProfileRow;
        Insert: Omit<ProfileRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ProfileRow, 'id' | 'auth_user_id' | 'role' | 'school_id'>>;
      };
      student_profiles: {
        Row: StudentProfileRow;
        Insert: Omit<StudentProfileRow, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<StudentProfileRow, 'id' | 'profile_id'>>;
      };
      teacher_profiles: {
        Row: TeacherProfileRow;
        Insert: Omit<TeacherProfileRow, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<TeacherProfileRow, 'id' | 'profile_id'>>;
      };
      classes: {
        Row: ClassRow;
        Insert: Omit<ClassRow, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<ClassRow, 'id'>>;
      };
      class_students: {
        Row: ClassStudentRow;
        Insert: ClassStudentRow;
        Update: Partial<ClassStudentRow>;
      };
      subjects: {
        Row: SubjectRow;
        Insert: Omit<SubjectRow, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<SubjectRow, 'id'>>;
      };
      student_learning_stats: {
        Row: StudentLearningStatsRow;
        Insert: StudentLearningStatsRow;
        Update: Partial<StudentLearningStatsRow>;
      };
      student_journey_nodes: {
        Row: StudentJourneyNodeRow;
        Insert: StudentJourneyNodeRow;
        Update: Partial<StudentJourneyNodeRow>;
      };
      student_achievements: {
        Row: StudentAchievementRow;
        Insert: Omit<StudentAchievementRow, 'id'> & { id?: string };
        Update: Partial<StudentAchievementRow>;
      };
      student_recent_activities: {
        Row: StudentRecentActivityRow;
        Insert: Omit<StudentRecentActivityRow, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<StudentRecentActivityRow>;
      };
      student_active_lesson: {
        Row: StudentActiveLessonRow;
        Insert: StudentActiveLessonRow;
        Update: Partial<StudentActiveLessonRow>;
      };
      topics: {
        Row: TopicRow;
        Insert: Omit<TopicRow, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<TopicRow, 'id'>>;
      };
      questions: {
        Row: QuestionRow;
        Insert: Omit<QuestionRow, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<QuestionRow, 'id'>>;
      };
      assessments: {
        Row: AssessmentRow;
        Insert: Omit<AssessmentRow, 'id' | 'started_at' | 'completed_at'> & {
          id?: string;
          started_at?: string;
          completed_at?: string | null;
        };
        Update: Partial<Omit<AssessmentRow, 'id'>>;
      };
      assessment_answers: {
        Row: AssessmentAnswerRow;
        Insert: Omit<AssessmentAnswerRow, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<AssessmentAnswerRow, 'id'>>;
      };
      student_mastery: {
        Row: StudentMasteryRow;
        Insert: Omit<StudentMasteryRow, 'id' | 'last_attempted_at'> & {
          id?: string;
          last_attempted_at?: string;
        };
        Update: Partial<Omit<StudentMasteryRow, 'id'>>;
      };
      learning_paths: {
        Row: LearningPathRow;
        Insert: Omit<LearningPathRow, 'id' | 'generated_at'> & {
          id?: string;
          generated_at?: string;
        };
        Update: Partial<Omit<LearningPathRow, 'id'>>;
      };
      learning_path_items: {
        Row: LearningPathItemRow;
        Insert: Omit<LearningPathItemRow, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<LearningPathItemRow, 'id'>>;
      };
      education_boards: {
        Row: import('./library').EducationBoardRow;
        Insert: Omit<import('./library').EducationBoardRow, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<import('./library').EducationBoardRow, 'id'>>;
      };
      chapters: {
        Row: import('./library').ChapterRow;
        Insert: Omit<import('./library').ChapterRow, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<import('./library').ChapterRow, 'id'>>;
      };
      lessons: {
        Row: import('./library').LessonRow;
        Insert: Omit<import('./library').LessonRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<import('./library').LessonRow, 'id'>>;
      };
      lesson_content: {
        Row: import('./library').LessonContentRow;
        Insert: Omit<import('./library').LessonContentRow, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<import('./library').LessonContentRow, 'id'>>;
      };
      lesson_resources: {
        Row: import('./library').LessonResourceRow;
        Insert: Omit<import('./library').LessonResourceRow, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<import('./library').LessonResourceRow, 'id'>>;
      };
      bookmarks: {
        Row: import('./library').BookmarkRow;
        Insert: Omit<import('./library').BookmarkRow, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<import('./library').BookmarkRow, 'id'>>;
      };
      student_progress: {
        Row: import('./library').StudentProgressRow;
        Insert: Omit<import('./library').StudentProgressRow, 'id' | 'last_accessed_at'> & {
          id?: string;
          last_accessed_at?: string;
        };
        Update: Partial<Omit<import('./library').StudentProgressRow, 'id'>>;
      };
    };
  };
}

export * from './library';

