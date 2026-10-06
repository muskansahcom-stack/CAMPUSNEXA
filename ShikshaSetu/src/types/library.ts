export type LessonContentType =
  | 'video'
  | 'notes'
  | 'audio'
  | 'images'
  | 'interactive'
  | 'worksheet'
  | 'quiz';

export type LessonResourceType = 'pdf' | 'audio' | 'worksheet' | 'diagram' | 'image';

export type LessonProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface EducationBoardRow {
  id: string;
  country: string;
  state: string;
  code: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface ChapterRow {
  id: string;
  subject_id: string;
  education_board_id: string;
  grade: number;
  chapter_number: number;
  title: string;
  description: string | null;
  created_at: string;
}

export interface LessonRow {
  id: string;
  chapter_id: string;
  topic_id: string | null;
  title: string;
  short_explanation: string;
  learning_objectives: string[];
  sequence_order: number;
  is_published: boolean;
  is_download_eligible: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface LessonContentRow {
  id: string;
  lesson_id: string;
  content_type: LessonContentType;
  title: string;
  body_text: string | null;
  media_url: string | null;
  storage_path: string | null;
  duration_seconds: number;
  download_size_bytes: number;
  is_downloadable: boolean;
  sequence_order: number;
  created_at: string;
}

export interface LessonResourceRow {
  id: string;
  lesson_id: string;
  resource_type: LessonResourceType;
  file_name: string;
  file_url: string;
  storage_path: string | null;
  file_size_bytes: number;
  is_downloadable: boolean;
  created_at: string;
}

export interface BookmarkRow {
  id: string;
  student_id: string;
  lesson_id: string;
  created_at: string;
}

export interface StudentProgressRow {
  id: string;
  student_id: string;
  lesson_id: string;
  status: LessonProgressStatus;
  progress_pct: number;
  last_accessed_at: string;
  completed_at: string | null;
}

export interface LessonSummaryItem {
  id: string;
  title: string;
  short_explanation: string;
  learning_objectives: string[];
  chapter_id: string;
  chapter_title?: string;
  board_id?: string;
  board_code?: string;
  board_name?: string;
  grade?: number;
  subject_id?: string;
  subject_name?: string;
  topic_id?: string | null;
  sequence_order?: number;
  is_published: boolean;
  is_download_eligible: boolean;
  content_types: LessonContentType[];
  total_duration_minutes: number;
  is_bookmarked?: boolean;
  progress_pct?: number;
  progress_status?: LessonProgressStatus;
  is_offline_cached?: boolean;
}

export interface LessonDetail extends LessonSummaryItem {
  content: LessonContentRow[];
  resources: LessonResourceRow[];
}

export interface LibraryFilters {
  boardId?: string;
  grade?: number;
  subjectId?: string;
  language?: string;
  searchQuery?: string;
  downloadableOnly?: boolean;
  bookmarkedOnly?: boolean;
}

export interface OfflineDownloadedLesson {
  lessonId: string;
  downloadedAt: string;
  lesson: LessonDetail;
  totalSizeBytes: number;
}
