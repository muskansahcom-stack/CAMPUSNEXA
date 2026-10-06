import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  saveDownloadedLesson,
  getDownloadedLesson,
  deleteDownloadedLesson,
  getAllDownloadedLessons,
} from './offline/indexedDb';
import { syncEngine } from './offline/syncEngine';
import {
  EducationBoardRow,
  ChapterRow,
  LessonRow,
  LessonContentRow,
  LessonResourceRow,
  LessonSummaryItem,
  LessonDetail,
  LibraryFilters,
  OfflineDownloadedLesson,
  LessonProgressStatus,
} from '../types/library';

// ==========================================================
// RESILIENT FALLBACK DATA (For Offline & Local Preview)
// ==========================================================

export const FALLBACK_BOARDS: EducationBoardRow[] = [
  {
    id: 'eb000000-0000-0000-0000-000000000001',
    country: 'India',
    state: 'National',
    code: 'CBSE',
    name: 'Central Board of Secondary Education',
    description: 'National curriculum followed across all Indian states and Union Territories.',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'eb000000-0000-0000-0000-000000000002',
    country: 'India',
    state: 'Rajasthan',
    code: 'RBSE',
    name: 'Board of Secondary Education, Rajasthan',
    description: 'State board curriculum with contextualized examples for arid ecosystems and local community models.',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'eb000000-0000-0000-0000-000000000003',
    country: 'India',
    state: 'Maharashtra',
    code: 'MSBSHSE',
    name: 'Maharashtra State Board of Secondary and Higher Secondary Education',
    description: 'State board curriculum offering dual Marathi and English contextualized learning tracks.',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'eb000000-0000-0000-0000-000000000004',
    country: 'India',
    state: 'Odisha',
    code: 'BSE_ODISHA',
    name: 'Board of Secondary Education, Odisha',
    description: 'State board curriculum supporting Eastern Indian coastal and tribal community learning priorities.',
    created_at: '2026-01-01T00:00:00Z',
  },
];

export const FALLBACK_CHAPTERS: ChapterRow[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    subject_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', // Mathematics
    education_board_id: 'eb000000-0000-0000-0000-000000000002', // RBSE
    grade: 8,
    chapter_number: 1,
    title: 'Fractions & Proportions in Everyday Life',
    description: 'Foundational understanding of fractions, equivalence, scaling, and sharing models in rural households.',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    subject_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', // Environmental Science
    education_board_id: 'eb000000-0000-0000-0000-000000000002', // RBSE
    grade: 8,
    chapter_number: 1,
    title: 'Water Conservation & Traditional Rainwater Harvesting',
    description: 'Ecosystem balance, water table dynamics, and historic Rajasthani stepwells (Baoris) and johads.',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    subject_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', // Mathematics
    education_board_id: 'eb000000-0000-0000-0000-000000000001', // CBSE
    grade: 8,
    chapter_number: 2,
    title: 'Practical Geometry: Village Land & Perimeter',
    description: 'Applying 2D geometric shapes, boundaries, and area calculations to agricultural plots and community spaces.',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    subject_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', // Science
    education_board_id: 'eb000000-0000-0000-0000-000000000001', // CBSE
    grade: 8,
    chapter_number: 2,
    title: 'Solar Energy & Community Microgrids',
    description: 'Principles of solar photovoltaics, solar thermal cookers, and decentralized clean energy in Indian villages.',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000005',
    subject_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', // Mathematics
    education_board_id: 'eb000000-0000-0000-0000-000000000003', // MSBSHSE
    grade: 7,
    chapter_number: 1,
    title: 'Fractions, Decimals & Market Weights',
    description: 'Connecting fractions with local mandi market weights and currency transactions.',
    created_at: '2026-01-01T00:00:00Z',
  },
];

export const FALLBACK_LESSONS: LessonRow[] = [
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    chapter_id: 'c0000000-0000-0000-0000-000000000001',
    topic_id: '11000000-0000-0000-0000-000000000004',
    title: 'Understanding Fractions: Parts of a Whole',
    short_explanation: 'Learn how fractions represent equal parts of a whole object or collection, using familiar chapati and farmland examples.',
    learning_objectives: [
      'Identify the numerator as the count of chosen parts',
      'Identify the denominator as the total number of equal parts',
      'Visualize 1/2, 1/3, and 1/4 using geometric division',
      'Compare simple fractions with identical denominators',
    ],
    sequence_order: 1,
    is_published: true,
    is_download_eligible: true,
    created_by: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'd0000000-0000-0000-0000-000000000002',
    chapter_id: 'c0000000-0000-0000-0000-000000000002',
    topic_id: null,
    title: 'Traditional Stepwells (Baori) & Water Conservation',
    short_explanation: 'Explore how historical Indian stepwells captured monsoon runoff, recharged dry aquifers, and provided reliable potable water.',
    learning_objectives: [
      'Explain how aquifer replenishment occurs via rainwater harvesting',
      'Identify architectural features of a Rajasthani Baori',
      'Calculate water collection volume based on roof catchment area',
      'List 3 household methods to prevent water contamination',
    ],
    sequence_order: 1,
    is_published: true,
    is_download_eligible: true,
    created_by: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'd0000000-0000-0000-0000-000000000003',
    chapter_id: 'c0000000-0000-0000-0000-000000000003',
    topic_id: null,
    title: 'Village Land Boundaries & Perimeter Calculations',
    short_explanation: 'Understand perimeter as the total boundary distance around a field and calculate fencing wire requirements.',
    learning_objectives: [
      'Define perimeter as the total outer boundary of any 2D polygon',
      'Calculate perimeter of rectangular and irregular crop fields',
      'Estimate barbed-wire length needed for a 3-strand fence',
      'Differentiate between linear boundary perimeter and enclosed 2D area',
    ],
    sequence_order: 1,
    is_published: true,
    is_download_eligible: true,
    created_by: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'd0000000-0000-0000-0000-000000000004',
    chapter_id: 'c0000000-0000-0000-0000-000000000004',
    topic_id: null,
    title: 'Solar Cookers & Renewable Thermal Energy',
    short_explanation: 'Discover how reflection and the greenhouse effect work together inside a solar box cooker to prepare nutritious meals cleanly.',
    learning_objectives: [
      'Explain reflection of sunlight using flat and curved mirrors',
      'Describe the greenhouse effect inside a glass-covered box',
      'List black surfaces as high thermal absorbers',
      'Compare firewood cooking with zero-emission solar cooking',
    ],
    sequence_order: 1,
    is_published: true,
    is_download_eligible: true,
    created_by: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

export const FALLBACK_CONTENT: Record<string, LessonContentRow[]> = {
  'd0000000-0000-0000-0000-000000000001': [
    {
      id: 'lc000000-0000-0000-0000-000000000001',
      lesson_id: 'd0000000-0000-0000-0000-000000000001',
      content_type: 'video',
      title: 'Visual Intro: Sharing a Chapati Fairly',
      body_text: 'A bandwidth-optimized 3-minute animation demonstrating how 4 friends equally divide 1 fresh roti into 4 equal quarters (1/4 each).',
      media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      storage_path: 'videos/fractions_intro.mp4',
      duration_seconds: 180,
      download_size_bytes: 1400000,
      is_downloadable: true,
      sequence_order: 1,
      created_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 'lc000000-0000-0000-0000-000000000002',
      lesson_id: 'd0000000-0000-0000-0000-000000000001',
      content_type: 'notes',
      title: 'Lesson Notes: The Language of Parts & Wholes',
      body_text: `### What is a Fraction?
When we divide any single object or group into **equal parts**, each part is a fraction.

### The Anatomy of a Fraction:
- **Numerator (Top)**: Tells us *how many parts we have or are talking about*.
- **Denominator (Bottom)**: Tells us *how many equal parts the whole was divided into*.

$$\\text{Fraction} = \\frac{\\text{Numerator (Parts Taken)}}{\\text{Denominator (Total Equal Parts)}}$$

### Everyday Village Example:
If farmer Ramu divides his 1-acre field into 4 equal plots and plants mustard on 3 plots:
- Total plots = 4 (Denominator)
- Mustard plots = 3 (Numerator)
- Mustard fraction = **3/4** of his field.

> **Key Golden Rule**: The parts must always be **strictly equal**! If one slice is bigger than the others, it is not a true mathematical fraction.`,
      media_url: null,
      storage_path: null,
      duration_seconds: 120,
      download_size_bytes: 4500,
      is_downloadable: true,
      sequence_order: 2,
      created_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 'lc000000-0000-0000-0000-000000000003',
      lesson_id: 'd0000000-0000-0000-0000-000000000001',
      content_type: 'audio',
      title: 'Spoken Story: Dadi Maa’s Kheer Sharing Model',
      body_text: 'Spoken vernacular audio story explaining how a grandmother divides a bowl of festival kheer equally among grandchildren without fighting.',
      media_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      storage_path: 'audio/fractions_story.mp3',
      duration_seconds: 150,
      download_size_bytes: 820000,
      is_downloadable: true,
      sequence_order: 3,
      created_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 'lc000000-0000-0000-0000-000000000004',
      lesson_id: 'd0000000-0000-0000-0000-000000000001',
      content_type: 'interactive',
      title: 'Interactive Fraction Slider: Roti Slicer',
      body_text: 'Drag the slider from 2 to 8 equal slices to watch how the denominator grows and the individual slice size gets smaller.',
      media_url: null,
      storage_path: null,
      duration_seconds: 90,
      download_size_bytes: 2500,
      is_downloadable: true,
      sequence_order: 4,
      created_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 'lc000000-0000-0000-0000-000000000005',
      lesson_id: 'd0000000-0000-0000-0000-000000000001',
      content_type: 'worksheet',
      title: 'Printable Worksheet: Village Fraction Challenges',
      body_text: `1. Color 3/5 of a honeycomb grid.
2. In a basket of 12 mangoes, 4 are ripe. What fraction is ripe?
3. Draw a circle and divide it into 8 equal slices. Shade 5/8.
4. If 2 chapatis are shared equally among 4 children, how much does each child get?`,
      media_url: 'https://example.com/worksheets/fractions_level1.pdf',
      storage_path: 'worksheets/fractions_level1.pdf',
      duration_seconds: 300,
      download_size_bytes: 150000,
      is_downloadable: true,
      sequence_order: 5,
      created_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 'lc000000-0000-0000-0000-000000000006',
      lesson_id: 'd0000000-0000-0000-0000-000000000001',
      content_type: 'quiz',
      title: 'Checkup Quiz: Test Your Understanding',
      body_text: JSON.stringify([
        {
          id: 'q1',
          question: 'In the fraction 3/8, which number is the denominator?',
          options: ['3', '8', '11', '5'],
          correct_answer: '8',
          explanation: 'The denominator is the bottom number indicating total equal parts.',
        },
        {
          id: 'q2',
          question: 'If a watermelon is cut into 6 equal slices and you eat 2 slices, what fraction did you eat?',
          options: ['1/6', '2/6', '4/6', '6/2'],
          correct_answer: '2/6',
          explanation: 'You ate 2 out of 6 equal slices, represented as 2/6 (which simplifies to 1/3).',
        },
      ]),
      media_url: null,
      storage_path: null,
      duration_seconds: 180,
      download_size_bytes: 3200,
      is_downloadable: true,
      sequence_order: 6,
      created_at: '2026-01-01T00:00:00Z',
    },
  ],
  'd0000000-0000-0000-0000-000000000002': [
    {
      id: 'lc000000-0000-0000-0000-000000000007',
      lesson_id: 'd0000000-0000-0000-0000-000000000002',
      content_type: 'notes',
      title: 'Lesson Notes: Traditional Water Architecture',
      body_text: `### The Ancient Wisdom of Stepwells (Baoris)
In regions with low annual rainfall such as Western India, communities built massive underground stone stepwells known as **Baoris** or **Vavs**.

### How Rainwater Harvesting Recharges Ground Water:
1. **Catchment**: Rain falling on hillsides or rooftop surfaces is channeled into silt traps.
2. **Filtration**: Sand, gravel, and charcoal filter out surface debris and sediments.
3. **Subsurface Recharge**: Clean water percolates slowly down to recharge the water table, keeping wells full even during hot summer months.

### Formula for Water Harvested:
$$\\text{Volume (Liters)} = \\text{Catchment Area } (m^2) \\times \\text{Rainfall } (mm) \\times \\text{Runoff Coefficient } (\\approx 0.8)$$`,
      media_url: null,
      storage_path: null,
      duration_seconds: 140,
      download_size_bytes: 5200,
      is_downloadable: true,
      sequence_order: 1,
      created_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 'lc000000-0000-0000-0000-000000000008',
      lesson_id: 'd0000000-0000-0000-0000-000000000002',
      content_type: 'audio',
      title: 'Audio Guide: Voices from the Mandawa Stepwell',
      body_text: 'Field recording and audio explanation of how historic desert architecture maintains natural cool temperatures and potable water.',
      media_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      storage_path: 'audio/water_stepwell_guide.mp3',
      duration_seconds: 210,
      download_size_bytes: 980000,
      is_downloadable: true,
      sequence_order: 2,
      created_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 'lc000000-0000-0000-0000-000000000009',
      lesson_id: 'd0000000-0000-0000-0000-000000000002',
      content_type: 'quiz',
      title: 'Quiz: Rainwater Harvesting Science',
      body_text: JSON.stringify([
        {
          id: 'w1',
          question: 'What is the primary purpose of a silt trap in rainwater harvesting?',
          options: ['To add minerals', 'To filter out soil & sediments', 'To cool the water', 'To measure rainfall'],
          correct_answer: 'To filter out soil & sediments',
          explanation: 'Silt traps capture heavy sediment particles so clean water can percolate into aquifers.',
        },
      ]),
      media_url: null,
      storage_path: null,
      duration_seconds: 120,
      download_size_bytes: 2200,
      is_downloadable: true,
      sequence_order: 3,
      created_at: '2026-01-01T00:00:00Z',
    },
  ],
  'd0000000-0000-0000-0000-000000000003': [
    {
      id: 'lc000000-0000-0000-0000-000000000010',
      lesson_id: 'd0000000-0000-0000-0000-000000000003',
      content_type: 'notes',
      title: 'Perimeter: Measuring Boundaries',
      body_text: `### Perimeter of a Field
Perimeter is the total length of the continuous boundary surrounding an area.

$$\\text{Perimeter of Rectangle} = 2 \\times (\\text{Length} + \\text{Width})$$

### Farm Fencing Calculation:
If a rectangular ground is 50 meters long and 30 meters wide:
- Perimeter = 2 * (50 + 30) = 160 meters.
- For a 3-strand wire fence: 160 * 3 = 480 meters of wire needed.`,
      media_url: null,
      storage_path: null,
      duration_seconds: 110,
      download_size_bytes: 3800,
      is_downloadable: true,
      sequence_order: 1,
      created_at: '2026-01-01T00:00:00Z',
    },
  ],
  'd0000000-0000-0000-0000-000000000004': [
    {
      id: 'lc000000-0000-0000-0000-000000000011',
      lesson_id: 'd0000000-0000-0000-0000-000000000004',
      content_type: 'notes',
      title: 'Solar Thermal Cookers',
      body_text: `### How a Solar Box Cooker Works:
1. **Reflection**: The shiny metal or glass reflector concentrates sunlight rays into the insulated cooking box.
2. **Absorption**: Black painted cooking pots absorb heat wavelengths efficiently.
3. **Greenhouse Trapping**: The glass lid prevents thermal infrared radiation from escaping, heating food up to 140°C.`,
      media_url: null,
      storage_path: null,
      duration_seconds: 100,
      download_size_bytes: 3400,
      is_downloadable: true,
      sequence_order: 1,
      created_at: '2026-01-01T00:00:00Z',
    },
  ],
};

export const FALLBACK_RESOURCES: Record<string, LessonResourceRow[]> = {
  'd0000000-0000-0000-0000-000000000001': [
    {
      id: 'lr000000-0000-0000-0000-000000000001',
      lesson_id: 'd0000000-0000-0000-0000-000000000001',
      resource_type: 'pdf',
      file_name: 'Fractions_Everyday_Practice_Worksheet.pdf',
      file_url: 'https://example.com/storage/resources/fractions_practice.pdf',
      storage_path: 'resources/fractions_practice.pdf',
      file_size_bytes: 240000,
      is_downloadable: true,
      created_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 'lr000000-0000-0000-0000-000000000002',
      lesson_id: 'd0000000-0000-0000-0000-000000000001',
      resource_type: 'diagram',
      file_name: 'Visual_Fraction_Wall_Chart.png',
      file_url: 'https://example.com/storage/resources/fraction_wall.png',
      storage_path: 'resources/fraction_wall.png',
      file_size_bytes: 185000,
      is_downloadable: true,
      created_at: '2026-01-01T00:00:00Z',
    },
  ],
  'd0000000-0000-0000-0000-000000000002': [
    {
      id: 'lr000000-0000-0000-0000-000000000003',
      lesson_id: 'd0000000-0000-0000-0000-000000000002',
      resource_type: 'pdf',
      file_name: 'Rainwater_Harvesting_Calculation_Guide.pdf',
      file_url: 'https://example.com/storage/resources/rainwater_harvesting.pdf',
      storage_path: 'resources/rainwater_harvesting.pdf',
      file_size_bytes: 310000,
      is_downloadable: true,
      created_at: '2026-01-01T00:00:00Z',
    },
  ],
};

// ==========================================================
// CORE REPOSITORY QUERIES
// ==========================================================

export async function fetchEducationBoards(): Promise<EducationBoardRow[]> {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase.from('education_boards') as any)
        .select('*')
        .order('name');
      if (!error && data && data.length > 0) {
        return data as EducationBoardRow[];
      }
    }
  } catch (err) {
    console.warn('Using fallback boards due to network/configuration:', err);
  }
  return FALLBACK_BOARDS;
}

export async function fetchChapters(
  boardId?: string,
  grade?: number,
  subjectId?: string
): Promise<ChapterRow[]> {
  try {
    if (isSupabaseConfigured) {
      let query = (supabase.from('chapters') as any).select('*');
      if (boardId) query = query.eq('education_board_id', boardId);
      if (grade) query = query.eq('grade', grade);
      if (subjectId) query = query.eq('subject_id', subjectId);

      const { data, error } = await query.order('chapter_number');
      if (!error && data && data.length > 0) {
        return data as ChapterRow[];
      }
    }
  } catch (err) {
    console.warn('Using fallback chapters:', err);
  }

  return FALLBACK_CHAPTERS.filter((ch) => {
    if (boardId && ch.education_board_id !== boardId) return false;
    if (grade && ch.grade !== grade) return false;
    if (subjectId && ch.subject_id !== subjectId) return false;
    return true;
  });
}

/**
 * Fetch lessons matching hierarchical filters with aggregated metadata,
 * bookmark status, and student completion progress.
 */
export async function fetchLessons(
  filters: LibraryFilters = {},
  studentId?: string
): Promise<LessonSummaryItem[]> {
  let allBoards = await fetchEducationBoards();
  let allChapters = await fetchChapters();
  let lessons: LessonRow[] = [];

  try {
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase.from('lessons') as any)
        .select('*')
        .eq('is_published', true)
        .order('sequence_order');

      if (!error && data && data.length > 0) {
        lessons = data as LessonRow[];
      } else {
        lessons = FALLBACK_LESSONS;
      }
    } else {
      lessons = FALLBACK_LESSONS;
    }
  } catch (err) {
    console.warn('Falling back to local lessons:', err);
    lessons = FALLBACK_LESSONS;
  }

  // Load local teacher-authored draft lessons if any exist in localStorage
  try {
    const authoredRaw = localStorage.getItem('shikshasetu_authored_lessons');
    if (authoredRaw) {
      const authored: LessonRow[] = JSON.parse(authoredRaw);
      lessons = [...authored, ...lessons];
    }
  } catch {
    // Ignore storage parse issues
  }

  // Fetch student bookmarks & progress
  const bookmarkedLessonIds = new Set<string>();
  const progressMap = new Map<string, { pct: number; status: LessonProgressStatus }>();

  if (studentId) {
    // From Supabase if available
    if (isSupabaseConfigured) {
      try {
        const { data: bData } = await (supabase.from('bookmarks') as any)
          .select('lesson_id')
          .eq('student_id', studentId);
        if (bData) {
          bData.forEach((b: any) => bookmarkedLessonIds.add(b.lesson_id));
        }

        const { data: pData } = await (supabase.from('student_progress') as any)
          .select('lesson_id, progress_pct, status')
          .eq('student_id', studentId);
        if (pData) {
          pData.forEach((p: any) =>
            progressMap.set(p.lesson_id, { pct: p.progress_pct, status: p.status })
          );
        }
      } catch (e) {
        console.warn('Using local bookmarks/progress:', e);
      }
    }

    // Merge with localStorage overrides
    try {
      const localBookmarks = JSON.parse(localStorage.getItem('shikshasetu_bookmarks') || '[]');
      localBookmarks.forEach((id: string) => bookmarkedLessonIds.add(id));

      const localProgress = JSON.parse(localStorage.getItem('shikshasetu_progress') || '{}');
      Object.entries(localProgress).forEach(([id, val]: [string, any]) => {
        progressMap.set(id, { pct: val.pct, status: val.status });
      });
    } catch {
      // Ignore
    }
  }

  // Build summary items
  const summaries: LessonSummaryItem[] = lessons.map((l) => {
    const chapter = allChapters.find((c) => c.id === l.chapter_id);
    const board = chapter ? allBoards.find((b) => b.id === chapter.education_board_id) : undefined;
    const contents = FALLBACK_CONTENT[l.id] || [];

    const contentTypes = Array.from(new Set(contents.map((c) => c.content_type)));
    const totalDurationSeconds = contents.reduce((acc, c) => acc + (c.duration_seconds || 0), 0);
    const totalDurationMinutes = Math.max(5, Math.round(totalDurationSeconds / 60));

    const progress = progressMap.get(l.id);
    const isOffline = isLessonOfflineCached(l.id);

    return {
      id: l.id,
      title: l.title,
      short_explanation: l.short_explanation,
      learning_objectives: l.learning_objectives || [],
      chapter_id: l.chapter_id,
      chapter_title: chapter?.title || 'Foundational Chapter',
      board_id: board?.id,
      board_code: board?.code || 'CBSE',
      board_name: board?.name || 'Central Board',
      grade: chapter?.grade || 8,
      subject_id: chapter?.subject_id || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      subject_name: chapter?.subject_id === 'cccccccc-cccc-cccc-cccc-cccccccccccc' ? 'Science' : 'Mathematics',
      topic_id: l.topic_id,
      sequence_order: l.sequence_order,
      is_published: l.is_published,
      is_download_eligible: l.is_download_eligible,
      content_types: contentTypes.length > 0 ? contentTypes : ['notes', 'quiz'],
      total_duration_minutes: totalDurationMinutes,
      is_bookmarked: bookmarkedLessonIds.has(l.id),
      progress_pct: progress?.pct || 0,
      progress_status: progress?.status || 'not_started',
      is_offline_cached: isOffline,
    };
  });

  // Apply filters
  return summaries.filter((item) => {
    if (filters.boardId && item.board_id !== filters.boardId) return false;
    if (filters.grade && item.grade !== filters.grade) return false;
    if (filters.subjectId && item.subject_id !== filters.subjectId) return false;
    if (filters.downloadableOnly && !item.is_offline_cached && !item.is_download_eligible) return false;
    if (filters.bookmarkedOnly && !item.is_bookmarked) return false;

    if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchExpl = item.short_explanation.toLowerCase().includes(q);
      const matchChapter = item.chapter_title?.toLowerCase().includes(q);
      const matchSubj = item.subject_name?.toLowerCase().includes(q);
      if (!matchTitle && !matchExpl && !matchChapter && !matchSubj) return false;
    }

    return true;
  });
}

/**
 * Fetch full lesson details including multi-modal content and resources.
 */
export async function fetchLessonDetail(
  lessonId: string,
  studentId?: string
): Promise<LessonDetail | null> {
  // Check IndexedDB offline storage first if disconnected
  try {
    const idbCached = await getDownloadedLesson(lessonId);
    if (idbCached) {
      return {
        id: idbCached.id,
        title: idbCached.title,
        short_explanation: idbCached.short_explanation,
        learning_objectives: idbCached.learning_objectives,
        chapter_id: 'ch_offline',
        chapter_title: idbCached.chapter_title,
        board_code: idbCached.board_code,
        grade: idbCached.grade,
        subject_name: idbCached.subject_name,
        is_published: true,
        is_download_eligible: true,
        content_types: idbCached.content.map((c: any) => c.content_type),
        total_duration_minutes: 10,
        is_offline_cached: true,
        content: idbCached.content,
        resources: idbCached.resources,
      };
    }
  } catch {}

  const offlineCached = getOfflineLessonById(lessonId);
  if (offlineCached) {
    return offlineCached.lesson;
  }

  const summaries = await fetchLessons({}, studentId);
  const summary = summaries.find((s) => s.id === lessonId);
  if (!summary) return null;

  let content: LessonContentRow[] = [];
  let resources: LessonResourceRow[] = [];

  if (isSupabaseConfigured) {
    try {
      const { data: cData } = await (supabase.from('lesson_content') as any)
        .select('*')
        .eq('lesson_id', lessonId)
        .order('sequence_order');
      if (cData && cData.length > 0) content = cData;

      const { data: rData } = await (supabase.from('lesson_resources') as any)
        .select('*')
        .eq('lesson_id', lessonId);
      if (rData && rData.length > 0) resources = rData;
    } catch {
      // Fallback below
    }
  }

  if (content.length === 0) {
    content = FALLBACK_CONTENT[lessonId] || [];
  }
  if (resources.length === 0) {
    resources = FALLBACK_RESOURCES[lessonId] || [];
  }

  return {
    ...summary,
    content,
    resources,
  };
}

// ==========================================================
// STUDENT BOOKMARKS & PROGRESS MUTATIONS
// ==========================================================

export async function toggleBookmark(
  studentId: string,
  lessonId: string
): Promise<{ isBookmarked: boolean }> {
  // Update local storage first for instant feedback & offline capability
  let localBookmarks: string[] = [];
  try {
    localBookmarks = JSON.parse(localStorage.getItem('shikshasetu_bookmarks') || '[]');
  } catch {
    localBookmarks = [];
  }

  const exists = localBookmarks.includes(lessonId);
  let isBookmarked = false;

  if (exists) {
    localBookmarks = localBookmarks.filter((id) => id !== lessonId);
    isBookmarked = false;
  } else {
    localBookmarks.push(lessonId);
    isBookmarked = true;
  }

  localStorage.setItem('shikshasetu_bookmarks', JSON.stringify(localBookmarks));

  // Sync through SyncEngine (Priority 2, offline resilient)
  syncEngine.recordOfflineBookmark(studentId, lessonId, isBookmarked).catch(() => {});

  return { isBookmarked };
}

export async function updateLessonProgress(
  studentId: string,
  lessonId: string,
  progressPct: number,
  status?: LessonProgressStatus
): Promise<{ success: boolean; progressPct: number; status: LessonProgressStatus }> {
  const finalStatus: LessonProgressStatus =
    status || (progressPct >= 100 ? 'completed' : progressPct > 0 ? 'in_progress' : 'not_started');

  // Save in localStorage for immediate offline persistence
  try {
    const localProgress = JSON.parse(localStorage.getItem('shikshasetu_progress') || '{}');
    localProgress[lessonId] = {
      pct: progressPct,
      status: finalStatus,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem('shikshasetu_progress', JSON.stringify(localProgress));
  } catch {
    // Ignore storage write issues
  }

  // Register in SyncEngine (Priority 1: Essential sync queue item)
  syncEngine.recordOfflineProgress(studentId, lessonId, progressPct).catch(() => {});

  return { success: true, progressPct, status: finalStatus };
}

export async function recordOfflineQuizAnswer(
  studentId: string,
  lessonId: string,
  questionId: string,
  chosenAnswer: string,
  isCorrect: boolean,
  score: number,
  totalQuestions: number
): Promise<void> {
  await syncEngine.recordOfflineQuizAttempt(
    studentId,
    lessonId,
    questionId,
    chosenAnswer,
    isCorrect,
    score,
    totalQuestions
  );
}

// ==========================================================
// OFFLINE DOWNLOAD CACHE (IndexedDB + Storage Backup)
// ==========================================================

const OFFLINE_INDEX_KEY = 'shikshasetu_offline_index';
const OFFLINE_LESSON_PREFIX = 'shikshasetu_offline_lesson_';

export function isLessonOfflineCached(lessonId: string): boolean {
  try {
    const index: string[] = JSON.parse(localStorage.getItem(OFFLINE_INDEX_KEY) || '[]');
    return index.includes(lessonId);
  } catch {
    return false;
  }
}

export function getOfflineLessonById(lessonId: string): OfflineDownloadedLesson | null {
  try {
    const raw = localStorage.getItem(`${OFFLINE_LESSON_PREFIX}${lessonId}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore
  }
  return null;
}

export function getOfflineLessons(): OfflineDownloadedLesson[] {
  try {
    const index: string[] = JSON.parse(localStorage.getItem(OFFLINE_INDEX_KEY) || '[]');
    return index
      .map((id) => getOfflineLessonById(id))
      .filter((l): l is OfflineDownloadedLesson => Boolean(l));
  } catch {
    return [];
  }
}

export async function downloadLessonForOffline(
  lesson: LessonDetail
): Promise<{ success: boolean; totalSizeBytes: number }> {
  // Calculate package size honestly
  const contentSize = lesson.content.reduce((acc, c) => acc + (c.download_size_bytes || 5000), 0);
  const resourceSize = lesson.resources.reduce((acc, r) => acc + (r.file_size_bytes || 20000), 0);
  const totalSizeBytes = contentSize + resourceSize;

  const offlinePayload: OfflineDownloadedLesson = {
    lessonId: lesson.id,
    downloadedAt: new Date().toISOString(),
    lesson: {
      ...lesson,
      is_offline_cached: true,
    },
    totalSizeBytes,
  };

  try {
    // 1. Save in IndexedDB (Primary)
    await saveDownloadedLesson({
      id: lesson.id,
      lessonId: lesson.id,
      title: lesson.title,
      short_explanation: lesson.short_explanation,
      learning_objectives: lesson.learning_objectives || [],
      chapter_title: lesson.chapter_title || '',
      board_code: lesson.board_code || 'CBSE',
      grade: lesson.grade || 8,
      subject_name: lesson.subject_name || 'Mathematics',
      content: lesson.content,
      resources: lesson.resources,
      downloadedAt: new Date().toISOString(),
      totalSizeBytes,
      is_offline: true,
    });

    // 2. Save in localStorage (Redundant backup for instant sync)
    localStorage.setItem(
      `${OFFLINE_LESSON_PREFIX}${lesson.id}`,
      JSON.stringify(offlinePayload)
    );

    const index: string[] = JSON.parse(localStorage.getItem(OFFLINE_INDEX_KEY) || '[]');
    if (!index.includes(lesson.id)) {
      index.push(lesson.id);
      localStorage.setItem(OFFLINE_INDEX_KEY, JSON.stringify(index));
    }

    return { success: true, totalSizeBytes };
  } catch (err) {
    console.error('Failed to store lesson offline:', err);
    return { success: false, totalSizeBytes: 0 };
  }
}

export function removeOfflineLesson(lessonId: string): boolean {
  try {
    deleteDownloadedLesson(lessonId).catch(() => {});
    localStorage.removeItem(`${OFFLINE_LESSON_PREFIX}${lessonId}`);
    const index: string[] = JSON.parse(localStorage.getItem(OFFLINE_INDEX_KEY) || '[]');
    const nextIndex = index.filter((id) => id !== lessonId);
    localStorage.setItem(OFFLINE_INDEX_KEY, JSON.stringify(nextIndex));
    return true;
  } catch {
    return false;
  }
}

// ==========================================================
// TEACHER CONTENT AUTHORING
// ==========================================================

export interface TeacherLessonCreateInput {
  title: string;
  chapter_id: string;
  topic_id?: string | null;
  short_explanation: string;
  learning_objectives: string[];
  is_published: boolean;
  notes_body?: string;
  video_url?: string;
  audio_url?: string;
  worksheet_text?: string;
}

export async function createTeacherLesson(
  input: TeacherLessonCreateInput,
  teacherProfileId: string
): Promise<{ success: boolean; lessonId: string }> {
  const newLessonId = 'lesson_' + Date.now();

  const newLesson: LessonRow = {
    id: newLessonId,
    chapter_id: input.chapter_id,
    topic_id: input.topic_id || null,
    title: input.title,
    short_explanation: input.short_explanation,
    learning_objectives: input.learning_objectives,
    sequence_order: 10,
    is_published: input.is_published,
    is_download_eligible: true,
    created_by: teacherProfileId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Build content items
  const contents: LessonContentRow[] = [];
  if (input.notes_body) {
    contents.push({
      id: 'lc_' + Date.now() + '_notes',
      lesson_id: newLessonId,
      content_type: 'notes',
      title: `${input.title} - Comprehensive Notes`,
      body_text: input.notes_body,
      media_url: null,
      storage_path: null,
      duration_seconds: 120,
      download_size_bytes: 4000,
      is_downloadable: true,
      sequence_order: 1,
      created_at: new Date().toISOString(),
    });
  }

  if (input.video_url) {
    contents.push({
      id: 'lc_' + Date.now() + '_video',
      lesson_id: newLessonId,
      content_type: 'video',
      title: `${input.title} - Video Explanation`,
      body_text: 'Curated teacher video explanation for visual understanding.',
      media_url: input.video_url,
      storage_path: null,
      duration_seconds: 240,
      download_size_bytes: 1800000,
      is_downloadable: true,
      sequence_order: 2,
      created_at: new Date().toISOString(),
    });
  }

  if (input.audio_url) {
    contents.push({
      id: 'lc_' + Date.now() + '_audio',
      lesson_id: newLessonId,
      content_type: 'audio',
      title: `${input.title} - Spoken Audio Lesson`,
      body_text: 'Vernacular audio guide for low-connectivity listening.',
      media_url: input.audio_url,
      storage_path: null,
      duration_seconds: 180,
      download_size_bytes: 900000,
      is_downloadable: true,
      sequence_order: 3,
      created_at: new Date().toISOString(),
    });
  }

  if (input.worksheet_text) {
    contents.push({
      id: 'lc_' + Date.now() + '_worksheet',
      lesson_id: newLessonId,
      content_type: 'worksheet',
      title: `${input.title} - Practice Worksheet`,
      body_text: input.worksheet_text,
      media_url: null,
      storage_path: null,
      duration_seconds: 300,
      download_size_bytes: 50000,
      is_downloadable: true,
      sequence_order: 4,
      created_at: new Date().toISOString(),
    });
  }

  // Attempt Supabase insert
  if (isSupabaseConfigured) {
    try {
      await (supabase.from('lessons') as any).insert(newLesson);
      if (contents.length > 0) {
        await (supabase.from('lesson_content') as any).insert(contents);
      }
    } catch (e) {
      console.warn('Supabase lesson creation failed; storing locally:', e);
    }
  }

  // Store in localStorage for immediate reflection in local authoring cockpit
  try {
    const authoredRaw = localStorage.getItem('shikshasetu_authored_lessons');
    const authored: LessonRow[] = authoredRaw ? JSON.parse(authoredRaw) : [];
    authored.unshift(newLesson);
    localStorage.setItem('shikshasetu_authored_lessons', JSON.stringify(authored));

    FALLBACK_CONTENT[newLessonId] = contents;
  } catch {
    // Ignore
  }

  return { success: true, lessonId: newLessonId };
}

export async function toggleLessonPublishStatus(
  lessonId: string,
  isPublished: boolean
): Promise<boolean> {
  if (isSupabaseConfigured) {
    try {
      await (supabase.from('lessons') as any)
        .update({ is_published: isPublished })
        .eq('id', lessonId);
    } catch {
      // Local fallback
    }
  }

  try {
    const authoredRaw = localStorage.getItem('shikshasetu_authored_lessons');
    if (authoredRaw) {
      const authored: LessonRow[] = JSON.parse(authoredRaw);
      const item = authored.find((l) => l.id === lessonId);
      if (item) {
        item.is_published = isPublished;
        localStorage.setItem('shikshasetu_authored_lessons', JSON.stringify(authored));
      }
    }
  } catch {
    // Ignore
  }

  return true;
}
