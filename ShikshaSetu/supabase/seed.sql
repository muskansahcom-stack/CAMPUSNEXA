-- ==========================================================
-- ShikshaSetu: Seed Data for Schools, Subjects & Learning Journey
-- ==========================================================

-- Insert Sample Rural Schools across India
INSERT INTO public.schools (id, name, region, state, district, address)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Govt. Higher Secondary School Mandawa', 'North', 'Rajasthan', 'Jhunjhunu', 'Main Village Chowk, Mandawa, Jhunjhunu - 333704'),
    ('22222222-2222-2222-2222-222222222222', 'Zilla Parishad High School Wardha', 'West', 'Maharashtra', 'Wardha', 'Near Panchayat Bhavan, Wardha - 442001'),
    ('33333333-3333-3333-3333-333333333333', 'Kalahandi Model Residential School', 'East', 'Odisha', 'Kalahandi', 'Bhawanipatna Block, Kalahandi - 766001'),
    ('44444444-4444-4444-4444-444444444444', 'Majuli Adarsha Vidyalaya', 'North-East', 'Assam', 'Majuli', 'Kamalabari Ghat Road, Majuli - 785106')
ON CONFLICT (id) DO NOTHING;

-- Insert Subjects
INSERT INTO public.subjects (id, name, description, language)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mathematics', 'Foundational numeracy, fractions, algebra, and everyday arithmetic', 'en'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'गणित (Mathematics)', 'दैनिक जीवन में भिन्न, बीजगणित और व्यावहारिक अंकगणित', 'hi'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Environmental Science', 'Ecosystems, water cycles, traditional water harvesting, and solar energy', 'en'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'विज्ञान (Science)', 'पारिस्थितिकी तंत्र, जल चक्र, भूजल संरक्षण और सौर ऊर्जा', 'hi')
ON CONFLICT (id) DO NOTHING;

-- Insert Personal Learning Journey Nodes (Foundational Math Path)
INSERT INTO public.student_journey_nodes (id, subject, title, order_index, status, estimated_mins, badge_label)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'Mathematics', 'Numbers & Place Values', 1, 'completed', 10, 'Mastered'),
    ('10000000-0000-0000-0000-000000000002', 'Mathematics', 'Addition & Subtraction Strategies', 2, 'completed', 12, 'Mastered'),
    ('10000000-0000-0000-0000-000000000003', 'Mathematics', 'Fractions & Proportions', 3, 'in_progress', 10, 'You Are Here'),
    ('10000000-0000-0000-0000-000000000004', 'Mathematics', 'Decimals & Money Calculations', 4, 'locked', 15, 'Next Milestone'),
    ('10000000-0000-0000-0000-000000000005', 'Mathematics', 'Algebraic Thinking & Scales', 5, 'locked', 18, 'Locked')
ON CONFLICT (id) DO NOTHING;

-- ==========================================================
-- TOPICS WITH HIERARCHICAL PREREQUISITE GRAPH (Mathematics)
-- ==========================================================

INSERT INTO public.topics (id, subject_id, name, description, difficulty, prerequisite_topic_id)
VALUES
    ('11000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Numbers & Place Value', 'Foundational counting, place values (units, tens, hundreds, thousands), and number line navigation.', 1, NULL),
    ('11000000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Addition & Subtraction Strategies', 'Combining and separating quantities, regrouping, and mental arithmetic.', 1, '11000000-0000-0000-0000-000000000001'),
    ('11000000-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Multiplication & Grouping', 'Repeated addition, equal distributions, farm crop yields, and sharing models.', 2, '11000000-0000-0000-0000-000000000002'),
    ('11000000-0000-0000-0000-000000000004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Fraction Basics (Parts of a Whole)', 'Understanding numerators and denominators, halves, thirds, and sharing chapatis or land evenly.', 2, '11000000-0000-0000-0000-000000000003'),
    ('11000000-0000-0000-0000-000000000005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Equivalent Fractions & Simplifying', 'Multiplying or dividing numerator and denominator by identical factors to maintain proportion.', 3, '11000000-0000-0000-0000-000000000004'),
    ('11000000-0000-0000-0000-000000000006', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Fractions with Unlike Denominators', 'Finding common denominators (LCM) to combine and compare unequal measurements.', 3, '11000000-0000-0000-0000-000000000005'),
    ('11000000-0000-0000-0000-000000000007', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Decimals & Everyday Money', 'Tenths, hundredths, converting fractions to decimals, and managing rupees and paise.', 4, '11000000-0000-0000-0000-000000000006'),
    ('11000000-0000-0000-0000-000000000008', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Algebraic Thinking & Unknowns', 'Balance scales, unknown quantities (x), and solving linear relationships.', 5, '11000000-0000-0000-0000-000000000007')
ON CONFLICT (id) DO NOTHING;

-- ==========================================================
-- CALIBRATED QUESTION BANK ACROSS DIFFICULTIES
-- ==========================================================

INSERT INTO public.questions (id, topic_id, question, options, correct_answer, explanation, difficulty)
VALUES
    -- Topic 1: Numbers & Place Value
    (
        '21000000-0000-0000-0000-000000000001',
        '11000000-0000-0000-0000-000000000001',
        'In the number 3,450 (the weight of grain harvested in kilograms), what is the place value of the digit 4?',
        '[{"id": "a", "text": "4 Ones (4)"}, {"id": "b", "text": "4 Tens (40)"}, {"id": "c", "text": "4 Hundreds (400)"}, {"id": "d", "text": "4 Thousands (4000)"}]'::jsonb,
        'c',
        'In 3,450, 0 is in the ones place, 5 is in the tens place (50), and 4 is in the hundreds place, representing 400 kg.',
        1
    ),
    (
        '21000000-0000-0000-0000-000000000002',
        '11000000-0000-0000-0000-000000000001',
        'Which number comes exactly halfway between 600 and 700 on a measuring scale?',
        '[{"id": "a", "text": "625"}, {"id": "b", "text": "650"}, {"id": "c", "text": "675"}, {"id": "d", "text": "690"}]'::jsonb,
        'b',
        'The difference between 700 and 600 is 100. Half of 100 is 50. Adding 50 to 600 gives 650.',
        1
    ),

    -- Topic 2: Addition & Subtraction
    (
        '21000000-0000-0000-0000-000000000003',
        '11000000-0000-0000-0000-000000000002',
        'A village cooperative had 148 saplings. They planted 79 in the morning. How many saplings remain to be planted?',
        '[{"id": "a", "text": "69 saplings"}, {"id": "b", "text": "71 saplings"}, {"id": "c", "text": "79 saplings"}, {"id": "d", "text": "89 saplings"}]'::jsonb,
        'a',
        'Subtract 79 from 148: 148 - 70 = 78, and 78 - 9 = 69 saplings.',
        1
    ),

    -- Topic 3: Multiplication & Grouping
    (
        '21000000-0000-0000-0000-000000000004',
        '11000000-0000-0000-0000-000000000003',
        'If a farmer packs 8 sacks of wheat each weighing 25 kg, what is the total weight of the wheat?',
        '[{"id": "a", "text": "160 kg"}, {"id": "b", "text": "180 kg"}, {"id": "c", "text": "200 kg"}, {"id": "d", "text": "250 kg"}]'::jsonb,
        'c',
        '8 sacks * 25 kg/sack = 200 kg. (You can compute 4 * 25 = 100, then double it to 200).',
        2
    ),

    -- Topic 4: Fraction Basics (Parts of a Whole)
    (
        '21000000-0000-0000-0000-000000000005',
        '11000000-0000-0000-0000-000000000004',
        'A round roti is divided into 4 equal slices. Shanti eats 3 slices. What fraction of the roti did Shanti eat?',
        '[{"id": "a", "text": "1/4"}, {"id": "b", "text": "3/4"}, {"id": "c", "text": "4/3"}, {"id": "d", "text": "3/1"}]'::jsonb,
        'b',
        'The denominator represents the total equal pieces (4), and the numerator represents the pieces taken (3). So Shanti ate 3/4 of the roti.',
        1
    ),
    (
        '21000000-0000-0000-0000-000000000006',
        '11000000-0000-0000-0000-000000000004',
        'Which fraction represents one half of a whole?',
        '[{"id": "a", "text": "1/3"}, {"id": "b", "text": "1/2"}, {"id": "c", "text": "2/1"}, {"id": "d", "text": "1/4"}]'::jsonb,
        'b',
        '1/2 represents 1 part out of 2 equal parts, which is one half.',
        1
    ),

    -- Topic 5: Equivalent Fractions & Simplifying
    (
        '21000000-0000-0000-0000-000000000007',
        '11000000-0000-0000-0000-000000000005',
        'Which fraction is equivalent to 2/3?',
        '[{"id": "a", "text": "4/6"}, {"id": "b", "text": "3/4"}, {"id": "c", "text": "4/9"}, {"id": "d", "text": "5/6"}]'::jsonb,
        'a',
        'Multiply both the numerator and the denominator by 2: (2 * 2) / (3 * 2) = 4/6.',
        2
    ),
    (
        '21000000-0000-0000-0000-000000000008',
        '11000000-0000-0000-0000-000000000005',
        'What is the simplified form of 6/8?',
        '[{"id": "a", "text": "2/4"}, {"id": "b", "text": "3/4"}, {"id": "c", "text": "3/8"}, {"id": "d", "text": "1/2"}]'::jsonb,
        'b',
        'Divide both numerator and denominator by their greatest common factor (2): 6 / 2 = 3 and 8 / 2 = 4, giving 3/4.',
        2
    ),
    (
        '21000000-0000-0000-0000-000000000009',
        '11000000-0000-0000-0000-000000000005',
        'If 3/5 = x/20, what is the value of x?',
        '[{"id": "a", "text": "9"}, {"id": "b", "text": "12"}, {"id": "c", "text": "15"}, {"id": "d", "text": "18"}]'::jsonb,
        'b',
        'Notice the denominator 5 is multiplied by 4 to get 20. Therefore, multiply the numerator 3 by 4 as well: 3 * 4 = 12.',
        3
    ),

    -- Topic 6: Fractions with Unlike Denominators
    (
        '21000000-0000-0000-0000-000000000010',
        '11000000-0000-0000-0000-000000000006',
        'What is 1/2 + 1/4?',
        '[{"id": "a", "text": "2/6"}, {"id": "b", "text": "3/4"}, {"id": "c", "text": "2/4"}, {"id": "d", "text": "1/8"}]'::jsonb,
        'b',
        'Convert 1/2 to an equivalent fraction with denominator 4: 1/2 = 2/4. Then add: 2/4 + 1/4 = 3/4.',
        2
    ),
    (
        '21000000-0000-0000-0000-000000000011',
        '11000000-0000-0000-0000-000000000006',
        'What is 2/3 - 1/6?',
        '[{"id": "a", "text": "1/3"}, {"id": "b", "text": "1/2"}, {"id": "c", "text": "3/6"}, {"id": "d", "text": "1/6"}]'::jsonb,
        'b',
        'Convert 2/3 to denominator 6: 2/3 = 4/6. Subtract: 4/6 - 1/6 = 3/6, which simplifies to 1/2.',
        3
    ),

    -- Topic 7: Decimals & Everyday Money
    (
        '21000000-0000-0000-0000-000000000012',
        '11000000-0000-0000-0000-000000000007',
        'Ramesh bought notebooks for Rs. 45.50 and pens for Rs. 24.25. How much did he spend in total?',
        '[{"id": "a", "text": "Rs. 69.50"}, {"id": "b", "text": "Rs. 69.75"}, {"id": "c", "text": "Rs. 70.00"}, {"id": "d", "text": "Rs. 70.25"}]'::jsonb,
        'b',
        'Add the rupees (45 + 24 = 69) and the paise (0.50 + 0.25 = 0.75). Total = Rs. 69.75.',
        2
    ),
    (
        '21000000-0000-0000-0000-000000000013',
        '11000000-0000-0000-0000-000000000007',
        'What is the decimal representation of the fraction 3/4?',
        '[{"id": "a", "text": "0.34"}, {"id": "b", "text": "0.43"}, {"id": "c", "text": "0.75"}, {"id": "d", "text": "0.80"}]'::jsonb,
        'c',
        '3 divided by 4 equals 0.75 (or 75/100).',
        3
    ),

    -- Topic 8: Algebraic Thinking & Unknowns
    (
        '21000000-0000-0000-0000-000000000014',
        '11000000-0000-0000-0000-000000000008',
        'On a balance scale, a basket of mangoes and a 2 kg weight balance an 8 kg weight. If m represents the weight of the mango basket, which equation is correct?',
        '[{"id": "a", "text": "m - 2 = 8"}, {"id": "b", "text": "m + 2 = 8"}, {"id": "c", "text": "2m = 8"}, {"id": "d", "text": "m / 2 = 8"}]'::jsonb,
        'b',
        'The left pan contains m + 2 kg, balancing the right pan of 8 kg, giving m + 2 = 8 (so m = 6 kg).',
        3
    ),
    (
        '21000000-0000-0000-0000-000000000015',
        '11000000-0000-0000-0000-000000000008',
        'If 3x + 5 = 20, what is the value of x?',
        '[{"id": "a", "text": "3"}, {"id": "b", "text": "5"}, {"id": "c", "text": "7"}, {"id": "d", "text": "15"}]'::jsonb,
        'b',
        'Subtract 5 from both sides: 3x = 15. Divide by 3: x = 15 / 3 = 5.',
        3
    )
ON CONFLICT (id) DO NOTHING;

-- ==========================================================
-- LEARNING LIBRARY SEED DATA (Configurable Multi-Region Boards & Content)
-- ==========================================================

-- 1. State & National Education Boards
INSERT INTO public.education_boards (id, country, state, code, name, description)
VALUES
    ('eb000000-0000-0000-0000-000000000001', 'India', 'National', 'CBSE', 'Central Board of Secondary Education', 'National curriculum followed across all Indian states and Union Territories.'),
    ('eb000000-0000-0000-0000-000000000002', 'India', 'Rajasthan', 'RBSE', 'Board of Secondary Education, Rajasthan', 'State board curriculum with contextualized examples for arid ecosystems and local community models.'),
    ('eb000000-0000-0000-0000-000000000003', 'India', 'Maharashtra', 'MSBSHSE', 'Maharashtra State Board of Secondary and Higher Secondary Education', 'State board curriculum offering dual Marathi and English contextualized learning tracks.'),
    ('eb000000-0000-0000-0000-000000000004', 'India', 'Odisha', 'BSE_ODISHA', 'Board of Secondary Education, Odisha', 'State board curriculum supporting Eastern Indian coastal and tribal community learning priorities.')
ON CONFLICT (id) DO NOTHING;

-- 2. Curriculum Chapters across Boards & Grades
INSERT INTO public.chapters (id, subject_id, education_board_id, grade, chapter_number, title, description)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'eb000000-0000-0000-0000-000000000002', 8, 1, 'Fractions & Proportions in Everyday Life', 'Foundational understanding of fractions, equivalence, scaling, and sharing models in rural households.'),
    ('c0000000-0000-0000-0000-000000000002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'eb000000-0000-0000-0000-000000000002', 8, 1, 'Water Conservation & Traditional Rainwater Harvesting', 'Ecosystem balance, water table dynamics, and historic Rajasthani stepwells (Baoris) and johads.'),
    ('c0000000-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'eb000000-0000-0000-0000-000000000001', 8, 2, 'Practical Geometry: Village Land & Perimeter', 'Applying 2D geometric shapes, boundaries, and area calculations to agricultural plots and community spaces.'),
    ('c0000000-0000-0000-0000-000000000004', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'eb000000-0000-0000-0000-000000000001', 8, 2, 'Solar Energy & Community Microgrids', 'Principles of solar photovoltaics, solar thermal cookers, and decentralized clean energy in Indian villages.'),
    ('c0000000-0000-0000-0000-000000000005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'eb000000-0000-0000-0000-000000000003', 7, 1, 'Fractions, Decimals & Market Weights', 'Connecting fractions with local mandi market weights (seer, chhatak, kilograms) and currency transactions.')
ON CONFLICT (id) DO NOTHING;

-- 3. Multi-Modal Lessons
INSERT INTO public.lessons (id, chapter_id, topic_id, title, short_explanation, learning_objectives, sequence_order, is_published, is_download_eligible)
VALUES
    (
        'd0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001',
        '11000000-0000-0000-0000-000000000004',
        'Understanding Fractions: Parts of a Whole',
        'Learn how fractions represent equal parts of a whole object or collection, using familiar chapati and farmland examples.',
        '["Identify the numerator as the count of chosen parts", "Identify the denominator as the total number of equal parts", "Visualize 1/2, 1/3, and 1/4 using geometric division", "Compare simple fractions with identical denominators"]'::jsonb,
        1,
        TRUE,
        TRUE
    ),
    (
        'd0000000-0000-0000-0000-000000000002',
        'c0000000-0000-0000-0000-000000000002',
        NULL,
        'Traditional Stepwells (Baori) & Water Conservation',
        'Explore how historical Indian stepwells captured monsoon runoff, recharged dry aquifers, and provided reliable potable water.',
        '["Explain how aquifer replenishment occurs via rainwater harvesting", "Identify architectural features of a Rajasthani Baori", "Calculate water collection volume based on roof catchment area", "List 3 household methods to prevent water contamination"]'::jsonb,
        1,
        TRUE,
        TRUE
    ),
    (
        'd0000000-0000-0000-0000-000000000003',
        'c0000000-0000-0000-0000-000000000003',
        NULL,
        'Village Land Boundaries & Perimeter Calculations',
        'Understand perimeter as the total boundary distance around a field and calculate fencing wire requirements.',
        '["Define perimeter as the total outer boundary of any 2D polygon", "Calculate perimeter of rectangular and irregular crop fields", "Estimate barbed-wire length needed for a 3-strand fence", "Differentiate between linear boundary perimeter and enclosed 2D area"]'::jsonb,
        1,
        TRUE,
        TRUE
    ),
    (
        'd0000000-0000-0000-0000-000000000004',
        'c0000000-0000-0000-0000-000000000004',
        NULL,
        'Solar Cookers & Renewable Thermal Energy',
        'Discover how reflection and the greenhouse effect work together inside a solar box cooker to prepare nutritious meals cleanly.',
        '["Explain reflection of sunlight using flat and curved mirrors", "Describe the greenhouse effect inside a glass-covered box", "List black surfaces as high thermal absorbers", "Compare firewood cooking with zero-emission solar cooking"]'::jsonb,
        1,
        TRUE,
        TRUE
    )
ON CONFLICT (id) DO NOTHING;

-- 4. Multi-Modal Lesson Content (Video, Notes, Audio, Images, Interactive, Worksheet, Quiz)
INSERT INTO public.lesson_content (id, lesson_id, content_type, title, body_text, media_url, storage_path, duration_seconds, download_size_bytes, is_downloadable, sequence_order)
VALUES
    -- Lesson 1: Fractions - Video
    (
        'lc000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000001',
        'video',
        'Visual Intro: Sharing a Chapati Fairly',
        'A bandwidth-optimized 3-minute animation demonstrating how 4 friends equally divide 1 fresh roti into 4 equal quarters (1/4 each).',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        'videos/fractions_intro.mp4',
        180,
        1400000, -- 1.4 MB optimized
        TRUE,
        1
    ),
    -- Lesson 1: Fractions - Notes
    (
        'lc000000-0000-0000-0000-000000000002',
        'd0000000-0000-0000-0000-000000000001',
        'notes',
        'Lesson Notes: The Language of Parts & Wholes',
        '### What is a Fraction?\nWhen we divide any single object or group into **equal parts**, each part is a fraction.\n\n### The Anatomy of a Fraction:\n- **Numerator (Top)**: Tells us *how many parts we have or are talking about*.\n- **Denominator (Bottom)**: Tells us *how many equal parts the whole was divided into*.\n\n$$\\text{Fraction} = \\frac{\\text{Numerator (Parts Taken)}}{\\text{Denominator (Total Equal Parts)}}$$\n\n### Everyday Village Example:\nIf farmer Ramu divides his 1-acre field into 4 equal plots and plants mustard on 3 plots:\n- Total plots = 4 (Denominator)\n- Mustard plots = 3 (Numerator)\n- Mustard fraction = **3/4** of his field.\n\n> **Key Golden Rule**: The parts must always be **strictly equal**! If one slice is bigger than the others, it is not a true mathematical fraction.',
        NULL,
        NULL,
        120,
        4500, -- 4.5 KB text
        TRUE,
        2
    ),
    -- Lesson 1: Fractions - Audio
    (
        'lc000000-0000-0000-0000-000000000003',
        'd0000000-0000-0000-0000-000000000001',
        'audio',
        'Spoken Story: Dadi Maa’s Kheer Sharing Model',
        'Spoken vernacular audio story explaining how a grandmother divides a bowl of festival kheer equally among grandchildren without fighting.',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        'audio/fractions_story.mp3',
        150,
        820000, -- 820 KB
        TRUE,
        3
    ),
    -- Lesson 1: Fractions - Interactive Explanation
    (
        'lc000000-0000-0000-0000-000000000004',
        'd0000000-0000-0000-0000-000000000001',
        'interactive',
        'Interactive Fraction Slider: Roti Slicer',
        'Drag the slider from 2 to 8 equal slices to watch how the denominator grows and the individual slice size gets smaller.',
        NULL,
        NULL,
        90,
        2500,
        TRUE,
        4
    ),
    -- Lesson 1: Fractions - Worksheet
    (
        'lc000000-0000-0000-0000-000000000005',
        'd0000000-0000-0000-0000-000000000001',
        'worksheet',
        'Printable Worksheet: Village Fraction Challenges',
        '1. Color 3/5 of a honeycomb.\n2. In a basket of 12 mangoes, 4 are ripe. What fraction is ripe?\n3. Draw a circle and divide it into 8 equal slices. Shade 5/8.\n4. If 2 chapatis are shared equally among 4 children, how much does each child get?',
        'https://example.com/worksheets/fractions_level1.pdf',
        'worksheets/fractions_level1.pdf',
        300,
        150000, -- 150 KB
        TRUE,
        5
    ),
    -- Lesson 1: Fractions - Quiz
    (
        'lc000000-0000-0000-0000-000000000006',
        'd0000000-0000-0000-0000-000000000001',
        'quiz',
        'Checkup Quiz: Test Your Understanding',
        '[{"id": "q1", "question": "In the fraction 3/8, which number is the denominator?", "options": ["3", "8", "11", "5"], "correct_answer": "8", "explanation": "The denominator is the bottom number indicating total equal parts."}, {"id": "q2", "question": "If a watermelon is cut into 6 equal slices and you eat 2 slices, what fraction did you eat?", "options": ["1/6", "2/6", "4/6", "6/2"], "correct_answer": "2/6", "explanation": "You ate 2 out of 6 equal slices, represented as 2/6 (which simplifies to 1/3)."}]',
        NULL,
        NULL,
        180,
        3200,
        TRUE,
        6
    ),

    -- Lesson 2: Water Conservation - Notes
    (
        'lc000000-0000-0000-0000-000000000007',
        'd0000000-0000-0000-0000-000000000002',
        'notes',
        'Lesson Notes: Traditional Water Architecture',
        '### The Ancient Wisdom of Stepwells (Baoris)\nIn regions with low annual rainfall such as Western India, communities built massive underground stone stepwells known as **Baoris** or **Vavs**.\n\n### How Rainwater Harvesting Recharges Ground Water:\n1. **Catchment**: Rain falling on hillsides or rooftop surfaces is channeled into silt traps.\n2. **Filtration**: Sand, gravel, and charcoal filter out surface debris and sediments.\n3. **Subsurface Recharge**: Clean water percolates slowly down to recharge the water table, keeping wells full even during hot summer months.\n\n### Formula for Water Harvested:\n$$\\text{Volume (Liters)} = \\text{Catchment Area } (m^2) \\times \\text{Rainfall } (mm) \\times \\text{Runoff Coefficient } (\\approx 0.8)$$',
        NULL,
        NULL,
        140,
        5200,
        TRUE,
        1
    ),
    -- Lesson 2: Water Conservation - Audio
    (
        'lc000000-0000-0000-0000-000000000008',
        'd0000000-0000-0000-0000-000000000002',
        'audio',
        'Audio Guide: Voices from the Mandawa Stepwell',
        'Field recording and audio explanation of how historic desert architecture maintains natural cool temperatures and potable water.',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        'audio/water_stepwell_guide.mp3',
        210,
        980000,
        TRUE,
        2
    )
ON CONFLICT (id) DO NOTHING;

-- 5. Downloadable Lesson Resources
INSERT INTO public.lesson_resources (id, lesson_id, resource_type, file_name, file_url, storage_path, file_size_bytes, is_downloadable)
VALUES
    (
        'lr000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000001',
        'pdf',
        'Fractions_Everyday_Practice_Worksheet.pdf',
        'https://example.com/storage/resources/fractions_practice.pdf',
        'resources/fractions_practice.pdf',
        240000,
        TRUE
    ),
    (
        'lr000000-0000-0000-0000-000000000002',
        'd0000000-0000-0000-0000-000000000001',
        'diagram',
        'Visual_Fraction_Wall_Chart.png',
        'https://example.com/storage/resources/fraction_wall.png',
        'resources/fraction_wall.png',
        185000,
        TRUE
    ),
    (
        'lr000000-0000-0000-0000-000000000003',
        'd0000000-0000-0000-0000-000000000002',
        'pdf',
        'Rainwater_Harvesting_Calculation_Guide.pdf',
        'https://example.com/storage/resources/rainwater_harvesting.pdf',
        'resources/rainwater_harvesting.pdf',
        310000,
        TRUE
    )
ON CONFLICT (id) DO NOTHING;


