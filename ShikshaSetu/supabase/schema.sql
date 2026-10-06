-- ==========================================================
-- ShikshaSetu: Production Supabase PostgreSQL Schema
-- Real Authentication, Profile Architecture & Row-Level Security
-- Extended with Student Learning State & Journey Graph
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DROP EXISTING CONFLICTING OBJECTS IF ANY
DROP TABLE IF EXISTS public.student_recent_activities CASCADE;
DROP TABLE IF EXISTS public.student_achievements CASCADE;
DROP TABLE IF EXISTS public.student_active_lesson CASCADE;
DROP TABLE IF EXISTS public.student_learning_stats CASCADE;
DROP TABLE IF EXISTS public.student_journey_nodes CASCADE;

DROP TABLE IF EXISTS public.class_students CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.teacher_profiles CASCADE;
DROP TABLE IF EXISTS public.student_profiles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.schools CASCADE;
DROP TABLE IF EXISTS public.subjects CASCADE;

DROP TYPE IF EXISTS public.user_role CASCADE;

-- 2. ENUM FOR AUTHORIZED ROLES
CREATE TYPE public.user_role AS ENUM ('student', 'teacher', 'school_admin');

-- 3. SCHOOLS TABLE
CREATE TABLE public.schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    region VARCHAR(100),
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role public.user_role NOT NULL DEFAULT 'student',
    preferred_language VARCHAR(32) DEFAULT 'en', -- en, hi, bn, mr, te, ta
    avatar_url TEXT,
    school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STUDENT PROFILES TABLE
CREATE TABLE public.student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    grade INT NOT NULL,
    class_name VARCHAR(64),
    learning_level VARCHAR(64) DEFAULT 'foundational',
    device_access VARCHAR(64) DEFAULT 'shared_phone', -- shared_phone, dedicated_phone, tablet, desktop
    connectivity_level VARCHAR(64) DEFAULT 'intermittent_2g', -- offline, intermittent_2g, 3g, 4g
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TEACHER PROFILES TABLE
CREATE TABLE public.teacher_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
    employee_id VARCHAR(64),
    subjects TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CLASSES TABLE
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(128) NOT NULL,
    grade INT NOT NULL,
    section VARCHAR(32),
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CLASS_STUDENTS JUNCTION TABLE
CREATE TABLE public.class_students (
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (class_id, student_id)
);

-- 9. SUBJECTS TABLE
CREATE TABLE public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(128) NOT NULL,
    description TEXT,
    language VARCHAR(32) DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. STUDENT LEARNING STATS
CREATE TABLE public.student_learning_stats (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    streak_days INT DEFAULT 5,
    xp_points INT DEFAULT 480,
    daily_goal_minutes INT DEFAULT 20,
    today_completed_minutes INT DEFAULT 14,
    overall_progress_pct INT DEFAULT 68,
    current_level_title VARCHAR(128) DEFAULT 'Level 4: Rising Explorer',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. STUDENT JOURNEY NODES
CREATE TABLE public.student_journey_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject VARCHAR(64) NOT NULL DEFAULT 'Mathematics',
    title VARCHAR(128) NOT NULL,
    order_index INT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'locked', -- completed, in_progress, locked
    estimated_mins INT DEFAULT 10,
    badge_label VARCHAR(64)
);

-- 12. STUDENT ACHIEVEMENTS
CREATE TABLE public.student_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_code VARCHAR(64) NOT NULL,
    title VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(64) DEFAULT 'Award',
    unlocked_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. STUDENT RECENT ACTIVITIES
CREATE TABLE public.student_recent_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(64) NOT NULL,
    activity_type VARCHAR(64) NOT NULL, -- 'quiz', 'lesson', 'audio', 'download'
    xp_earned INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. STUDENT ACTIVE LESSON
CREATE TABLE public.student_active_lesson (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(64) NOT NULL,
    topic VARCHAR(128) NOT NULL,
    progress_pct INT DEFAULT 65,
    estimated_remaining_mins INT DEFAULT 8,
    next_action_label VARCHAR(128) DEFAULT 'Resume Practice'
);

-- ==========================================================
-- AI PERSONALIZATION & ADAPTIVE LEARNING ENGINE TABLES
-- ==========================================================

-- 15. TOPICS (with Hierarchical Prerequisite Graph)
CREATE TABLE public.topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty INT NOT NULL DEFAULT 1, -- 1 (Foundational) to 5 (Advanced)
    prerequisite_topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. QUESTIONS (Calibrated Question Bank with Explanations & Difficulties)
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of { id, text, hint? }
    correct_answer TEXT NOT NULL,
    explanation TEXT NOT NULL,
    difficulty INT NOT NULL DEFAULT 1, -- 1: Easy/Foundational, 2: Medium/Standard, 3: Hard/Challenge
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. ASSESSMENTS (Diagnostic & Adaptive Testing Sessions)
CREATE TABLE public.assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    status VARCHAR(32) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    score NUMERIC(5, 2) DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 18. ASSESSMENT ANSWERS (Item-level Telemetry & Response Time)
CREATE TABLE public.assessment_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    response_time INT DEFAULT 0, -- Duration in seconds
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. STUDENT MASTERY (Bayesian/Weighted Topic Mastery Tracking)
CREATE TABLE public.student_mastery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    mastery_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (mastery_score >= 0 AND mastery_score <= 100),
    attempts INT NOT NULL DEFAULT 0,
    correct_attempts INT NOT NULL DEFAULT 0,
    last_attempted_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_student_topic_mastery UNIQUE (student_id, topic_id)
);

-- 20. LEARNING PATHS (Personalized Roadmaps Generated by AI Engine)
CREATE TABLE public.learning_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. LEARNING PATH ITEMS (Ordered Sequence with Topic States)
CREATE TABLE public.learning_path_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learning_path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    sequence INT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'mastered', 'needs_practice')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Fast Adaptive Traversal
CREATE INDEX idx_topics_subject_prereq ON public.topics(subject_id, prerequisite_topic_id);
CREATE INDEX idx_questions_topic_difficulty ON public.questions(topic_id, difficulty);
CREATE INDEX idx_assessments_student_status ON public.assessments(student_id, status);
CREATE INDEX idx_assessment_answers_assessment ON public.assessment_answers(assessment_id);
CREATE INDEX idx_student_mastery_student ON public.student_mastery(student_id);
CREATE INDEX idx_learning_paths_student_subject ON public.learning_paths(student_id, subject_id);
CREATE INDEX idx_learning_path_items_path_seq ON public.learning_path_items(learning_path_id, sequence);

-- 22. EDUCATION BOARDS (Configurable Multi-Region Curriculum Foundation)
CREATE TABLE public.education_boards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country VARCHAR(64) NOT NULL DEFAULT 'India',
    state VARCHAR(128) NOT NULL,
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. CHAPTERS (Curriculum Division by Board, Grade, and Subject)
CREATE TABLE public.chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    education_board_id UUID NOT NULL REFERENCES public.education_boards(id) ON DELETE CASCADE,
    grade INT NOT NULL CHECK (grade BETWEEN 1 AND 12),
    chapter_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_board_subject_grade_chapter UNIQUE (education_board_id, subject_id, grade, chapter_number)
);

-- 24. LESSONS (Structured Teaching Units linked to Chapters and Optional Topics)
CREATE TABLE public.lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    short_explanation TEXT NOT NULL,
    learning_objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
    sequence_order INT NOT NULL DEFAULT 1,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    is_download_eligible BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. LESSON CONTENT (Multi-Modal Elements: Video, Notes, Audio, Images, Interactive, Worksheet, Quiz)
CREATE TABLE public.lesson_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    content_type VARCHAR(32) NOT NULL CHECK (content_type IN ('video', 'notes', 'audio', 'images', 'interactive', 'worksheet', 'quiz')),
    title VARCHAR(255) NOT NULL,
    body_text TEXT,
    media_url TEXT,
    storage_path TEXT,
    duration_seconds INT DEFAULT 0,
    download_size_bytes BIGINT DEFAULT 0,
    is_downloadable BOOLEAN NOT NULL DEFAULT TRUE,
    sequence_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. LESSON RESOURCES (Downloadable Attachments, Diagrams & Worksheets in Supabase Storage)
CREATE TABLE public.lesson_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    resource_type VARCHAR(32) NOT NULL CHECK (resource_type IN ('pdf', 'audio', 'worksheet', 'diagram', 'image')),
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    storage_path TEXT,
    file_size_bytes BIGINT DEFAULT 0,
    is_downloadable BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 27. BOOKMARKS (Student-Saved Lessons for Fast Quick-Access)
CREATE TABLE public.bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_student_lesson_bookmark UNIQUE (student_id, lesson_id)
);

-- 28. STUDENT PROGRESS (Lesson Level Completion & Pacing)
CREATE TABLE public.student_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    status VARCHAR(32) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    progress_pct INT NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    CONSTRAINT uq_student_lesson_progress UNIQUE (student_id, lesson_id)
);

-- Indexes for Fast Learning Library Exploration
CREATE INDEX idx_education_boards_state ON public.education_boards(state);
CREATE INDEX idx_education_boards_code ON public.education_boards(code);
CREATE INDEX idx_chapters_board_subj_grade ON public.chapters(education_board_id, subject_id, grade);
CREATE INDEX idx_lessons_chapter ON public.lessons(chapter_id);
CREATE INDEX idx_lessons_topic ON public.lessons(topic_id);
CREATE INDEX idx_lessons_published ON public.lessons(is_published);
CREATE INDEX idx_lesson_content_lesson_seq ON public.lesson_content(lesson_id, sequence_order);
CREATE INDEX idx_lesson_resources_lesson ON public.lesson_resources(lesson_id);
CREATE INDEX idx_bookmarks_student ON public.bookmarks(student_id);
CREATE INDEX idx_bookmarks_lesson ON public.bookmarks(lesson_id);
CREATE INDEX idx_student_progress_student ON public.student_progress(student_id);
CREATE INDEX idx_student_progress_lesson ON public.student_progress(lesson_id);

-- ==========================================================
-- SECURITY DEFINER HELPER FUNCTIONS
-- ==========================================================

CREATE OR REPLACE FUNCTION public.get_auth_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_auth_school_id()
RETURNS UUID
LANGUAGE sql
STABLE
SET search_path = public
SECURITY DEFINER
AS $$
    SELECT school_id FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

-- ==========================================================
-- DATABASE TRIGGERS
-- ==========================================================

-- Function: Create profile and default student stats automatically on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    assigned_role public.user_role;
    user_school_id UUID;
    user_full_name TEXT;
    user_lang TEXT;
    student_grade INT;
    device_type TEXT;
    new_profile_id UUID;
BEGIN
    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
    user_lang := COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en');
    
    -- SECURITY ENFORCEMENT:
    -- Self-service signup strictly defaults to 'student'.
    -- 'teacher' or 'school_admin' roles require valid institutional verification code or service_role authorization.
    IF NEW.raw_user_meta_data->>'role' IN ('teacher', 'school_admin') THEN
        IF UPPER(COALESCE(NEW.raw_user_meta_data->>'institutional_code', '')) IN ('SHIKSHA-EDU-2026', 'UDISE-ODISHA-212604', 'UDISE-WARDHA-270801', 'DISTRICT-ADMIN-SECRET')
           OR auth.jwt() ->> 'role' = 'service_role' THEN
            assigned_role := (NEW.raw_user_meta_data->>'role')::public.user_role;
        ELSE
            -- Unauthorized attempt to self-elevate role is safely blocked and set to 'student'
            assigned_role := 'student'::public.user_role;
        END IF;
    ELSE
        assigned_role := 'student'::public.user_role;
    END IF;

    IF NEW.raw_user_meta_data->>'school_id' IS NOT NULL AND NEW.raw_user_meta_data->>'school_id' != '' THEN
        BEGIN
            user_school_id := (NEW.raw_user_meta_data->>'school_id')::UUID;
        EXCEPTION WHEN OTHERS THEN
            user_school_id := NULL;
        END IF;
    END IF;

    -- 1. Insert into profiles
    INSERT INTO public.profiles (
        auth_user_id,
        full_name,
        email,
        role,
        preferred_language,
        school_id
    ) VALUES (
        NEW.id,
        user_full_name,
        NEW.email,
        assigned_role,
        user_lang,
        user_school_id
    ) RETURNING id INTO new_profile_id;

    -- 2. Insert role-specific profile & initial companion stats
    IF assigned_role = 'student' THEN
        student_grade := COALESCE((NEW.raw_user_meta_data->>'grade')::INT, 8);
        device_type := COALESCE(NEW.raw_user_meta_data->>'device_access', 'shared_phone');

        INSERT INTO public.student_profiles (
            profile_id,
            grade,
            class_name,
            device_access
        ) VALUES (
            new_profile_id,
            student_grade,
            'Grade ' || student_grade,
            device_type
        );

        -- Initialize learning companion stats
        INSERT INTO public.student_learning_stats (
            profile_id,
            streak_days,
            xp_points,
            daily_goal_minutes,
            today_completed_minutes,
            overall_progress_pct,
            current_level_title
        ) VALUES (
            new_profile_id,
            1,
            50,
            20,
            5,
            15,
            'Level 1: Young Explorer'
        );

        -- Initialize in-progress lesson
        INSERT INTO public.student_active_lesson (
            profile_id,
            title,
            subject,
            topic,
            progress_pct,
            estimated_remaining_mins,
            next_action_label
        ) VALUES (
            new_profile_id,
            'Fractions & Proportions in Everyday Life',
            'Mathematics',
            'Unit Fractions in Market Measurements',
            65,
            8,
            'Continue Lesson'
        );
    ELSIF assigned_role = 'teacher' THEN
        INSERT INTO public.teacher_profiles (
            profile_id,
            school_id,
            employee_id,
            subjects
        ) VALUES (
            new_profile_id,
            user_school_id,
            COALESCE(NEW.raw_user_meta_data->>'employee_id', 'TCH-' || substr(NEW.id::text, 1, 6)),
            ARRAY['Mathematics', 'Science']
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Prevent users from updating their own role or school_id
CREATE OR REPLACE FUNCTION public.prevent_role_and_school_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Prevent altering primary key or auth identity
    IF (NEW.id IS DISTINCT FROM OLD.id) THEN
        RAISE EXCEPTION 'Security Violation: Immutable profile identifier cannot be altered.';
    END IF;

    IF (NEW.auth_user_id IS DISTINCT FROM OLD.auth_user_id) THEN
        RAISE EXCEPTION 'Security Violation: Associated authentication identity cannot be altered.';
    END IF;

    -- Prevent altering role
    IF (NEW.role IS DISTINCT FROM OLD.role) THEN
        RAISE EXCEPTION 'Security Violation: Users cannot alter their own account role.';
    END IF;

    -- Prevent unauthorized school reassignment
    IF (NEW.school_id IS DISTINCT FROM OLD.school_id AND auth.jwt() ->> 'role' != 'service_role') THEN
        IF public.get_auth_role() != 'school_admin' THEN
            RAISE EXCEPTION 'Security Violation: School reassignment requires administrative authorization.';
        END IF;
    END IF;

    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_role_and_school_escalation();

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.student_learning_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_journey_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_recent_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_active_lesson ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_items ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.education_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

-- 1. SCHOOLS
CREATE POLICY "Authenticated users view schools"
    ON public.schools FOR SELECT
    TO authenticated
    USING (TRUE);

-- 2. PROFILES
CREATE POLICY "Profiles access policy"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (
        auth_user_id = auth.uid()
        OR (
            public.get_auth_role() = 'school_admin'
            AND school_id = public.get_auth_school_id()
        )
        OR (
            public.get_auth_role() = 'teacher'
            AND id IN (
                SELECT cs.student_id
                FROM public.class_students cs
                JOIN public.classes c ON c.id = cs.class_id
                WHERE c.teacher_id = public.get_auth_profile_id()
            )
        )
    );

CREATE POLICY "Profiles update own policy"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth_user_id = auth.uid())
    WITH CHECK (auth_user_id = auth.uid());

-- 3. STUDENT PROFILES
CREATE POLICY "Student profiles select policy"
    ON public.student_profiles FOR SELECT
    TO authenticated
    USING (
        profile_id = public.get_auth_profile_id()
        OR (
            public.get_auth_role() = 'teacher'
            AND profile_id IN (
                SELECT cs.student_id
                FROM public.class_students cs
                JOIN public.classes c ON c.id = cs.class_id
                WHERE c.teacher_id = public.get_auth_profile_id()
            )
        )
        OR (
            public.get_auth_role() = 'school_admin'
            AND profile_id IN (
                SELECT id FROM public.profiles WHERE school_id = public.get_auth_school_id()
            )
        )
    );

CREATE POLICY "Students update own student profile"
    ON public.student_profiles FOR UPDATE
    TO authenticated
    USING (profile_id = public.get_auth_profile_id())
    WITH CHECK (profile_id = public.get_auth_profile_id());

-- 4. TEACHER PROFILES
CREATE POLICY "Teacher profiles select policy"
    ON public.teacher_profiles FOR SELECT
    TO authenticated
    USING (
        profile_id = public.get_auth_profile_id()
        OR (
            public.get_auth_role() = 'school_admin'
            AND school_id = public.get_auth_school_id()
        )
    );

-- 5. CLASSES & CLASS_STUDENTS
CREATE POLICY "Classes select policy"
    ON public.classes FOR SELECT
    TO authenticated
    USING (
        (public.get_auth_role() = 'school_admin' AND school_id = public.get_auth_school_id())
        OR (teacher_id = public.get_auth_profile_id())
        OR (id IN (SELECT class_id FROM public.class_students WHERE student_id = public.get_auth_profile_id()))
    );

CREATE POLICY "School admin manage classes"
    ON public.classes FOR ALL
    TO authenticated
    USING (
        public.get_auth_role() = 'school_admin'
        AND school_id = public.get_auth_school_id()
    )
    WITH CHECK (
        public.get_auth_role() = 'school_admin'
        AND school_id = public.get_auth_school_id()
    );

CREATE POLICY "Class students select policy"
    ON public.class_students FOR SELECT
    TO authenticated
    USING (
        student_id = public.get_auth_profile_id()
        OR class_id IN (SELECT id FROM public.classes WHERE teacher_id = public.get_auth_profile_id())
        OR class_id IN (SELECT id FROM public.classes WHERE school_id = public.get_auth_school_id() AND public.get_auth_role() = 'school_admin')
    );

CREATE POLICY "School admin manage class students"
    ON public.class_students FOR ALL
    TO authenticated
    USING (
        public.get_auth_role() = 'school_admin'
        AND class_id IN (
            SELECT id FROM public.classes
            WHERE school_id = public.get_auth_school_id()
        )
    )
    WITH CHECK (
        public.get_auth_role() = 'school_admin'
        AND class_id IN (
            SELECT id FROM public.classes
            WHERE school_id = public.get_auth_school_id()
        )
    );

-- 6. SUBJECTS
CREATE POLICY "Authenticated users view subjects"
    ON public.subjects FOR SELECT
    TO authenticated
    USING (TRUE);

-- 7. STUDENT LEARNING STATS & ACTIVE LESSON (Strictly isolated to the student and their authorized teachers/admins)
CREATE POLICY "Student learning stats select policy"
    ON public.student_learning_stats FOR SELECT
    TO authenticated
    USING (
        profile_id = public.get_auth_profile_id()
        OR (
            public.get_auth_role() = 'teacher'
            AND profile_id IN (
                SELECT cs.student_id
                FROM public.class_students cs
                JOIN public.classes c ON c.id = cs.class_id
                WHERE c.teacher_id = public.get_auth_profile_id()
            )
        )
        OR (
            public.get_auth_role() = 'school_admin'
            AND profile_id IN (
                SELECT id FROM public.profiles WHERE school_id = public.get_auth_school_id()
            )
        )
    );

CREATE POLICY "Students manage own learning stats"
    ON public.student_learning_stats FOR ALL
    TO authenticated
    USING (profile_id = public.get_auth_profile_id())
    WITH CHECK (profile_id = public.get_auth_profile_id());

CREATE POLICY "Students manage own active lesson"
    ON public.student_active_lesson FOR ALL
    TO authenticated
    USING (profile_id = public.get_auth_profile_id())
    WITH CHECK (profile_id = public.get_auth_profile_id());

CREATE POLICY "Students view own achievements"
    ON public.student_achievements FOR ALL
    TO authenticated
    USING (profile_id = public.get_auth_profile_id())
    WITH CHECK (profile_id = public.get_auth_profile_id());

CREATE POLICY "Students view own recent activities"
    ON public.student_recent_activities FOR ALL
    TO authenticated
    USING (profile_id = public.get_auth_profile_id())
    WITH CHECK (profile_id = public.get_auth_profile_id());

CREATE POLICY "Journey nodes viewable by all authenticated"
    ON public.student_journey_nodes FOR SELECT
    TO authenticated
    USING (TRUE);

-- ==========================================================
-- 8. AI PERSONALIZATION & ADAPTIVE LEARNING POLICIES
-- ==========================================================

-- Topics & Questions (Accessible for reading by all authenticated learners/educators)
CREATE POLICY "Topics readable by authenticated users"
    ON public.topics FOR SELECT
    TO authenticated
    USING (TRUE);

CREATE POLICY "Questions readable by authenticated users"
    ON public.questions FOR SELECT
    TO authenticated
    USING (TRUE);

-- Assessments (Students manage own assessments, teachers/admins can monitor)
CREATE POLICY "Assessments select policy"
    ON public.assessments FOR SELECT
    TO authenticated
    USING (
        student_id = public.get_auth_profile_id()
        OR (
            public.get_auth_role() = 'teacher'
            AND student_id IN (
                SELECT cs.student_id
                FROM public.class_students cs
                JOIN public.classes c ON c.id = cs.class_id
                WHERE c.teacher_id = public.get_auth_profile_id()
            )
        )
        OR (
            public.get_auth_role() = 'school_admin'
            AND student_id IN (
                SELECT id FROM public.profiles WHERE school_id = public.get_auth_school_id()
            )
        )
    );

CREATE POLICY "Students insert own assessments"
    ON public.assessments FOR INSERT
    TO authenticated
    WITH CHECK (student_id = public.get_auth_profile_id());

CREATE POLICY "Students update own assessments"
    ON public.assessments FOR UPDATE
    TO authenticated
    USING (student_id = public.get_auth_profile_id())
    WITH CHECK (student_id = public.get_auth_profile_id());

-- Assessment Answers
CREATE POLICY "Assessment answers select policy"
    ON public.assessment_answers FOR SELECT
    TO authenticated
    USING (
        assessment_id IN (
            SELECT id FROM public.assessments WHERE student_id = public.get_auth_profile_id()
        )
        OR (
            public.get_auth_role() = 'teacher'
            AND assessment_id IN (
                SELECT a.id FROM public.assessments a
                JOIN public.class_students cs ON cs.student_id = a.student_id
                JOIN public.classes c ON c.id = cs.class_id
                WHERE c.teacher_id = public.get_auth_profile_id()
            )
        )
        OR (
            public.get_auth_role() = 'school_admin'
            AND assessment_id IN (
                SELECT a.id FROM public.assessments a
                JOIN public.profiles p ON p.id = a.student_id
                WHERE p.school_id = public.get_auth_school_id()
            )
        )
    );

CREATE POLICY "Students insert assessment answers"
    ON public.assessment_answers FOR INSERT
    TO authenticated
    WITH CHECK (
        assessment_id IN (
            SELECT id FROM public.assessments WHERE student_id = public.get_auth_profile_id()
        )
    );

-- Student Mastery
CREATE POLICY "Student mastery select policy"
    ON public.student_mastery FOR SELECT
    TO authenticated
    USING (
        student_id = public.get_auth_profile_id()
        OR (
            public.get_auth_role() = 'teacher'
            AND student_id IN (
                SELECT cs.student_id
                FROM public.class_students cs
                JOIN public.classes c ON c.id = cs.class_id
                WHERE c.teacher_id = public.get_auth_profile_id()
            )
        )
        OR (
            public.get_auth_role() = 'school_admin'
            AND student_id IN (
                SELECT id FROM public.profiles WHERE school_id = public.get_auth_school_id()
            )
        )
    );

CREATE POLICY "Students manage own mastery"
    ON public.student_mastery FOR ALL
    TO authenticated
    USING (student_id = public.get_auth_profile_id())
    WITH CHECK (student_id = public.get_auth_profile_id());

-- Learning Paths
CREATE POLICY "Learning paths select policy"
    ON public.learning_paths FOR SELECT
    TO authenticated
    USING (
        student_id = public.get_auth_profile_id()
        OR (
            public.get_auth_role() = 'teacher'
            AND student_id IN (
                SELECT cs.student_id
                FROM public.class_students cs
                JOIN public.classes c ON c.id = cs.class_id
                WHERE c.teacher_id = public.get_auth_profile_id()
            )
        )
        OR (
            public.get_auth_role() = 'school_admin'
            AND student_id IN (
                SELECT id FROM public.profiles WHERE school_id = public.get_auth_school_id()
            )
        )
    );

CREATE POLICY "Students manage own learning paths"
    ON public.learning_paths FOR ALL
    TO authenticated
    USING (student_id = public.get_auth_profile_id())
    WITH CHECK (student_id = public.get_auth_profile_id());

-- Learning Path Items
CREATE POLICY "Learning path items select policy"
    ON public.learning_path_items FOR SELECT
    TO authenticated
    USING (
        learning_path_id IN (
            SELECT id FROM public.learning_paths WHERE student_id = public.get_auth_profile_id()
        )
        OR (
            public.get_auth_role() = 'teacher'
            AND learning_path_id IN (
                SELECT lp.id FROM public.learning_paths lp
                JOIN public.class_students cs ON cs.student_id = lp.student_id
                JOIN public.classes c ON c.id = cs.class_id
                WHERE c.teacher_id = public.get_auth_profile_id()
            )
        )
        OR (
            public.get_auth_role() = 'school_admin'
            AND learning_path_id IN (
                SELECT lp.id FROM public.learning_paths lp
                JOIN public.profiles p ON p.id = lp.student_id
                WHERE p.school_id = public.get_auth_school_id()
            )
        )
    );

CREATE POLICY "Students manage own learning path items"
    ON public.learning_path_items FOR ALL
    TO authenticated
    USING (
        learning_path_id IN (
            SELECT id FROM public.learning_paths WHERE student_id = public.get_auth_profile_id()
        )
    )
    WITH CHECK (
        learning_path_id IN (
            SELECT id FROM public.learning_paths WHERE student_id = public.get_auth_profile_id()
        )
    );

-- ==========================================================
-- 22-28. LEARNING LIBRARY RLS POLICIES
-- ==========================================================

-- 22. EDUCATION BOARDS
CREATE POLICY "Education boards select policy"
    ON public.education_boards FOR SELECT
    TO authenticated
    USING (TRUE);

CREATE POLICY "Education boards manage policy"
    ON public.education_boards FOR ALL
    TO authenticated
    USING (public.get_auth_role() IN ('teacher', 'school_admin'))
    WITH CHECK (public.get_auth_role() IN ('teacher', 'school_admin'));

-- 23. CHAPTERS
CREATE POLICY "Chapters select policy"
    ON public.chapters FOR SELECT
    TO authenticated
    USING (TRUE);

CREATE POLICY "Chapters manage policy"
    ON public.chapters FOR ALL
    TO authenticated
    USING (public.get_auth_role() IN ('teacher', 'school_admin'))
    WITH CHECK (public.get_auth_role() IN ('teacher', 'school_admin'));

-- 24. LESSONS
CREATE POLICY "Lessons select policy"
    ON public.lessons FOR SELECT
    TO authenticated
    USING (
        is_published = TRUE
        OR created_by = public.get_auth_profile_id()
        OR public.get_auth_role() IN ('teacher', 'school_admin')
    );

CREATE POLICY "Teachers create lessons"
    ON public.lessons FOR INSERT
    TO authenticated
    WITH CHECK (public.get_auth_role() IN ('teacher', 'school_admin'));

CREATE POLICY "Teachers update own lessons or admin"
    ON public.lessons FOR UPDATE
    TO authenticated
    USING (
        created_by = public.get_auth_profile_id()
        OR public.get_auth_role() = 'school_admin'
    )
    WITH CHECK (
        created_by = public.get_auth_profile_id()
        OR public.get_auth_role() = 'school_admin'
    );

CREATE POLICY "Teachers delete own lessons or admin"
    ON public.lessons FOR DELETE
    TO authenticated
    USING (
        created_by = public.get_auth_profile_id()
        OR public.get_auth_role() = 'school_admin'
    );

-- 25. LESSON CONTENT
CREATE POLICY "Lesson content select policy"
    ON public.lesson_content FOR SELECT
    TO authenticated
    USING (
        lesson_id IN (
            SELECT id FROM public.lessons
            WHERE is_published = TRUE
               OR created_by = public.get_auth_profile_id()
               OR public.get_auth_role() IN ('teacher', 'school_admin')
        )
    );

CREATE POLICY "Lesson content manage policy"
    ON public.lesson_content FOR ALL
    TO authenticated
    USING (public.get_auth_role() IN ('teacher', 'school_admin'))
    WITH CHECK (public.get_auth_role() IN ('teacher', 'school_admin'));

-- 26. LESSON RESOURCES
CREATE POLICY "Lesson resources select policy"
    ON public.lesson_resources FOR SELECT
    TO authenticated
    USING (
        lesson_id IN (
            SELECT id FROM public.lessons
            WHERE is_published = TRUE
               OR created_by = public.get_auth_profile_id()
               OR public.get_auth_role() IN ('teacher', 'school_admin')
        )
    );

CREATE POLICY "Lesson resources manage policy"
    ON public.lesson_resources FOR ALL
    TO authenticated
    USING (public.get_auth_role() IN ('teacher', 'school_admin'))
    WITH CHECK (public.get_auth_role() IN ('teacher', 'school_admin'));

-- 27. BOOKMARKS
CREATE POLICY "Bookmarks select policy"
    ON public.bookmarks FOR SELECT
    TO authenticated
    USING (student_id = public.get_auth_profile_id());

CREATE POLICY "Bookmarks manage policy"
    ON public.bookmarks FOR ALL
    TO authenticated
    USING (student_id = public.get_auth_profile_id())
    WITH CHECK (student_id = public.get_auth_profile_id());

-- 28. STUDENT PROGRESS
CREATE POLICY "Student progress select policy"
    ON public.student_progress FOR SELECT
    TO authenticated
    USING (
        student_id = public.get_auth_profile_id()
        OR (
            public.get_auth_role() = 'teacher'
            AND student_id IN (
                SELECT cs.student_id
                FROM public.class_students cs
                JOIN public.classes c ON c.id = cs.class_id
                WHERE c.teacher_id = public.get_auth_profile_id()
            )
        )
        OR (
            public.get_auth_role() = 'school_admin'
            AND student_id IN (
                SELECT id FROM public.profiles WHERE school_id = public.get_auth_school_id()
            )
        )
    );

CREATE POLICY "Students manage own progress"
    ON public.student_progress FOR ALL
    TO authenticated
    USING (student_id = public.get_auth_profile_id())
    WITH CHECK (student_id = public.get_auth_profile_id());

-- ==========================================================
-- 29. SUPABASE STORAGE POLICIES & BUCKET SECURITY
-- ==========================================================

-- Ensure storage schema & buckets exist with file size and MIME constraints
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    (
        'lesson-resources', 
        'lesson-resources', 
        TRUE, 
        26214400, -- 25 MB limit
        ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'text/plain']
    ),
    (
        'avatars', 
        'avatars', 
        TRUE, 
        3145728, -- 3 MB limit
        ARRAY['image/jpeg', 'image/png', 'image/webp']
    )
ON CONFLICT (id) DO UPDATE SET 
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Objects Policies
-- 1. Lesson Resources: Anyone authenticated can read/download published resources
CREATE POLICY "Lesson resources readable by authenticated users"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'lesson-resources');

-- 2. Lesson Resources: Only teachers and school admins can upload resources
CREATE POLICY "Teachers and admins upload lesson resources"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'lesson-resources'
        AND public.get_auth_role() IN ('teacher', 'school_admin')
    );

-- 3. Lesson Resources: Teachers and admins can delete lesson resources
CREATE POLICY "Teachers and admins delete lesson resources"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'lesson-resources'
        AND public.get_auth_role() IN ('teacher', 'school_admin')
    );

-- 4. Avatars: Readable by authenticated users
CREATE POLICY "Avatars readable by authenticated users"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'avatars');

-- 5. Avatars: Users can only upload to their own user folder (auth.uid())
CREATE POLICY "Users upload own avatar"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- 6. Avatars: Users can update/delete their own avatar
CREATE POLICY "Users manage own avatar"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );


