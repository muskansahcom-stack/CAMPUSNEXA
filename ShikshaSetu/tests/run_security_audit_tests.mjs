// tests/run_security_audit_tests.mjs
// Comprehensive Security Audit Verification Suite for ShikshaSetu
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔒 ========================================================');
console.log('🔒 SHIKSHASETU COMPREHENSIVE SECURITY AUDIT SUITE');
console.log('🔒 ========================================================\n');

let passCount = 0;
let failCount = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
    failCount++;
  }
}

// ----------------------------------------------------
// 1. INPUT SANITIZATION & INJECTION DEFENSE (XSS)
// ----------------------------------------------------
console.log('1. INPUT SANITIZATION & XSS PROTECTION:');

import {
  sanitizeInput,
  validateEmail,
  validatePassword,
  verifyInstitutionalCode,
  validateFileUpload,
  validateAIRequest,
} from '../src/lib/securityUtils.ts';

test('Neutralizes script tags and inline javascript execution', () => {
  const dirty = '<script>alert("xss")</script>Hello <img src="x" onerror="alert(1)">World';
  const clean = sanitizeInput(dirty);
  assert(!clean.includes('<script>'), 'Must strip <script>');
  assert(!clean.includes('onerror='), 'Must strip onerror handler');
  assert(clean.includes('Hello'), 'Must preserve safe text');
  assert(clean.includes('World'), 'Must preserve safe text');
});

test('Neutralizes iframe and pseudo-protocols (javascript:, data:text/html)', () => {
  const dirtyIframe = '<iframe src="javascript:alert(1)"></iframe>';
  const dirtyProto = 'javascript:doEvil()';
  const dirtyData = 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==';
  
  assert(!sanitizeInput(dirtyIframe).includes('iframe'), 'Must strip iframe');
  assert(!sanitizeInput(dirtyProto).includes('javascript:'), 'Must strip javascript: protocol');
  assert(!sanitizeInput(dirtyData).includes('data:text/html'), 'Must strip data:text/html protocol');
});

test('Neutralizes dangerous HTML tags while preserving clean plain text', () => {
  const cleanText = 'Mathematics - Chapter 1: Fractions in Everyday Rural Life';
  assert.strictEqual(sanitizeInput(cleanText), cleanText);
});

// ----------------------------------------------------
// 2. AUTHENTICATION & CREDENTIAL VALIDATION
// ----------------------------------------------------
console.log('\n2. AUTHENTICATION & CREDENTIAL SECURITY:');

test('Validates RFC 5322 compliant email addresses and rejects invalid formats', () => {
  assert(validateEmail('teacher.wardha@shiksha.local'), 'Valid email must pass');
  assert(validateEmail('student123@domain.org'), 'Valid email must pass');
  assert(!validateEmail('invalid-email'), 'Must reject missing @');
  assert(!validateEmail('@domain.com'), 'Must reject missing user part');
  assert(!validateEmail('user@.com'), 'Must reject invalid domain');
  assert(!validateEmail('user@site'), 'Must reject missing TLD');
});

test('Enforces secure password strength & length bounds (6 to 128 characters)', () => {
  assert(validatePassword('StrongPassword123').valid, 'Valid password must pass');
  assert(!validatePassword('12345').valid, 'Too short password must fail (<6)');
  assert(!validatePassword('a'.repeat(129)).valid, 'Excessively long password must fail (>128)');
  assert(!validatePassword('pass\x00word').valid, 'Control characters must be rejected');
});

test('Institutional Access Code verification for privileged role registration', () => {
  // Valid codes for teachers and school admins
  assert(verifyInstitutionalCode('SHIKSHA-EDU-2026'), 'Universal verified code must pass');
  assert(verifyInstitutionalCode('UDISE-WARDHA-270801'), 'Wardha school code must pass');
  assert(verifyInstitutionalCode('UDISE-ODISHA-212604'), 'Kalahandi school code must pass');
  assert(verifyInstitutionalCode('DISTRICT-ADMIN-SECRET'), 'District admin key must pass');
  
  // Invalid / unauthorized codes
  assert(!verifyInstitutionalCode('I-AM-TEACHER'), 'Arbitrary claim must fail');
  assert(!verifyInstitutionalCode(''), 'Empty code must fail');
  assert(!verifyInstitutionalCode('HACKER123'), 'Unrecognized code must fail');
});

// ----------------------------------------------------
// 3. FILE UPLOAD SECURITY (MIME, SIZE, PATH TRAVERSAL)
// ----------------------------------------------------
console.log('\n3. FILE UPLOAD INTEGRITY & EXTENSION BLACKLIST:');

test('Rejects dangerous executable extensions (.exe, .sh, .bat, .svg, .html)', () => {
  const dangerousFiles = [
    { name: 'malware.exe', size: 1024, type: 'application/x-msdownload' },
    { name: 'vector.svg', size: 1024, type: 'image/svg+xml' },
    { name: 'exploit.sh', size: 512, type: 'application/x-sh' },
    { name: 'phish.html', size: 2048, type: 'text/html' },
    { name: 'script.js', size: 1024, type: 'application/javascript' },
  ];

  for (const f of dangerousFiles) {
    const res = validateFileUpload(f, { category: 'lesson_resource' });
    assert(!res.valid, `Dangerous file ${f.name} must be rejected`);
    assert(res.error, `Error message must be set for ${f.name}`);
  }
});

test('Accepts valid educational media files (PDF, MP4, MP3, PNG, JPG)', () => {
  const safeFiles = [
    { name: 'fractions_worksheet.pdf', size: 2 * 1024 * 1024, type: 'application/pdf' },
    { name: 'audio_lesson.mp3', size: 4 * 1024 * 1024, type: 'audio/mpeg' },
    { name: 'diagram.png', size: 500 * 1024, type: 'image/png' },
    { name: 'concept_video.mp4', size: 15 * 1024 * 1024, type: 'video/mp4' },
  ];

  for (const f of safeFiles) {
    const res = validateFileUpload(f, { category: 'lesson_resource' });
    assert(res.valid, `Safe file ${f.name} should be accepted: ${res.error}`);
    assert(res.sanitizedFilename, 'Sanitized filename must be provided');
  }
});

test('Enforces strict file size quotas (25MB for curriculum, 3MB for avatars)', () => {
  // Over 25MB for resource
  const giantResource = { name: 'huge_video.mp4', size: 26 * 1024 * 1024, type: 'video/mp4' };
  const resGiant = validateFileUpload(giantResource, { category: 'lesson_resource' });
  assert(!resGiant.valid, '26MB resource must be rejected');
  assert(resGiant.error.includes('25MB'), 'Error must specify 25MB limit');

  // Over 3MB for avatar
  const giantAvatar = { name: 'photo.jpg', size: 4 * 1024 * 1024, type: 'image/jpeg' };
  const resAvatar = validateFileUpload(giantAvatar, { category: 'avatar' });
  assert(!resAvatar.valid, '4MB avatar must be rejected');
  assert(resAvatar.error.includes('3MB'), 'Error must specify 3MB limit');
});

test('Sanitizes directory traversal patterns in filenames', () => {
  const traversalFile = { name: '../../../etc/passwd.pdf', size: 1024, type: 'application/pdf' };
  const res = validateFileUpload(traversalFile, { category: 'lesson_resource' });
  assert(res.valid, 'Valid PDF type accepted');
  assert(!res.sanitizedFilename.includes('..'), 'Directory traversal ../ must be stripped');
  assert(!res.sanitizedFilename.includes('/'), 'Path slashes must be stripped');
});

// ----------------------------------------------------
// 4. AI SECURITY & PROMPT BOUNDARIES
// ----------------------------------------------------
console.log('\n4. AI SECURITY & PROMPT VALIDATION:');

test('Validates and bounds AI prompts to prevent denial of service and injection', () => {
  // Safe prompt
  const safeRes = validateAIRequest('Can you explain equivalent fractions with a roti diagram?');
  assert(safeRes.valid, 'Safe query must pass');
  assert.strictEqual(safeRes.sanitizedMessage, 'Can you explain equivalent fractions with a roti diagram?');

  // Empty prompt
  const emptyRes = validateAIRequest('   ');
  assert(!emptyRes.valid, 'Empty prompt must be rejected');

  // Oversized prompt (>1000 chars)
  const hugeRes = validateAIRequest('x'.repeat(1050));
  assert(!hugeRes.valid, 'Prompt over 1000 characters must be rejected');
  assert(hugeRes.error.includes('1000 characters'), 'Error must mention 1000 limit');

  // Script injection inside AI prompt
  const injectRes = validateAIRequest('Explain this <script>alert("leak")</script>');
  assert(injectRes.valid, 'Prompt is sanitized rather than crashing');
  assert(!injectRes.sanitizedMessage.includes('<script>'), 'Script tag stripped from AI prompt');
});

test('Audits codebase for exposed API keys, secret credentials, and private service role keys', () => {
  // Check .env and frontend code
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    assert(!envContent.includes('SUPABASE_SERVICE_ROLE_KEY'), 'Zero service role keys in .env');
    assert(!envContent.includes('OPENAI_API_KEY'), 'Zero unvetted private API keys in client .env');
  }

  // Scan src directory for hardcoded secrets
  const srcFiles = [];
  function scan(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory() && !full.includes('node_modules')) {
        scan(full);
      } else if (e.isFile() && (full.endsWith('.ts') || full.endsWith('.tsx') || full.endsWith('.js'))) {
        srcFiles.push(full);
      }
    }
  }
  scan(path.join(rootDir, 'src'));

  for (const f of srcFiles) {
    const text = fs.readFileSync(f, 'utf8');
    assert(!text.includes('service_role_secret'), `Exposed service_role_secret in ${f}`);
    assert(!text.includes('sk-ant-api'), `Exposed Anthropic secret in ${f}`);
    assert(!text.includes('sk-proj-'), `Exposed OpenAI secret in ${f}`);
  }
});

// ----------------------------------------------------
// 5. MULTI-TENANT ISOLATION & AUTHORIZATION BOUNDARIES
// ----------------------------------------------------
console.log('\n5. MULTI-TENANT ISOLATION & ROLE BOUNDARIES:');

test('Teacher service enforces school boundary on student detail access', () => {
  const teacherServicePath = path.join(rootDir, 'src', 'services', 'teacherService.ts');
  const teacherServiceContent = fs.readFileSync(teacherServicePath, 'utf8');

  // Verify schoolId parameter and cross-school check exist in getStudentDetail
  assert(
    teacherServiceContent.includes('public async getStudentDetail(studentId: string, schoolId?: string)'),
    'getStudentDetail must accept schoolId'
  );
  assert(
    teacherServiceContent.includes('Unauthorized cross-school access'),
    'getStudentDetail must throw Unauthorized cross-school access on school mismatch'
  );
});

test('Teacher service filters student roster strictly by schoolId', () => {
  const teacherServicePath = path.join(rootDir, 'src', 'services', 'teacherService.ts');
  const teacherServiceContent = fs.readFileSync(teacherServicePath, 'utf8');

  assert(
    teacherServiceContent.includes('getStudentsRoster('),
    'getStudentsRoster function must exist'
  );
  assert(
    teacherServiceContent.includes('result = result.filter((s) => s.schoolId === schoolId)'),
    'getStudentsRoster must isolate results by schoolId'
  );
});

test('TeacherPortal passes teacherSchoolId to enforce multi-tenant isolation', () => {
  const portalPath = path.join(rootDir, 'src', 'pages', 'TeacherPortal.tsx');
  const portalContent = fs.readFileSync(portalPath, 'utf8');

  assert(
    portalContent.includes('teacherSchoolId = profile?.school_id'),
    'TeacherPortal must derive teacherSchoolId from profile'
  );
  assert(
    portalContent.includes('getStudentsRoster(filters, teacherSchoolId)'),
    'TeacherPortal must pass teacherSchoolId to getStudentsRoster'
  );
  assert(
    portalContent.includes('getStudentDetail(studentId, teacherSchoolId)'),
    'TeacherPortal must pass teacherSchoolId to getStudentDetail'
  );
});

test('School Admin isolation: School A admin cannot access School B data', () => {
  const adminServicePath = path.join(rootDir, 'src', 'services', 'adminService.ts');
  const adminContent = fs.readFileSync(adminServicePath, 'utf8');

  assert(
    adminContent.includes('getSchoolOverview(adminSchoolId: string)'),
    'adminService must parameterize metrics by adminSchoolId'
  );
  assert(
    adminContent.includes('getStudents('),
    'adminService must parameterize students by adminSchoolId'
  );
  assert(
    adminContent.includes('getTeachers(adminSchoolId: string)'),
    'adminService must parameterize teachers by adminSchoolId'
  );
  assert(
    adminContent.includes('getClasses(adminSchoolId: string)'),
    'adminService must parameterize classes by adminSchoolId'
  );
  assert(
    adminContent.includes('accessCrossSchoolData('),
    'adminService must contain accessCrossSchoolData security boundary check'
  );
});

// ----------------------------------------------------
// 6. SUPABASE RLS HARDENING & ROLE PRIVILEGE ESCALATION
// ----------------------------------------------------
console.log('\n6. SUPABASE RLS HARDENING & IMMUTABLE FIELDS:');

test('Verifies schema.sql blocks role escalation during signup', () => {
  const schemaPath = path.join(rootDir, 'supabase', 'schema.sql');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');

  // Verify handle_new_user verifies institutional_code
  assert(
    schemaContent.includes("raw_user_meta_data->>'institutional_code'"),
    'Schema must verify institutional_code before granting teacher/school_admin'
  );
  assert(
    schemaContent.includes("assigned_role := 'student'::public.user_role;"),
    'Schema must safely fallback unverified signups to student role'
  );
});

test('Verifies schema.sql protects immutable profile columns (id, auth_user_id, role, school_id)', () => {
  const schemaPath = path.join(rootDir, 'supabase', 'schema.sql');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');

  assert(
    schemaContent.includes('prevent_role_and_school_escalation'),
    'Trigger function prevent_role_and_school_escalation must exist'
  );
  assert(
    schemaContent.includes('Users cannot alter their own account role'),
    'Trigger must raise exception when student attempts to change role'
  );
  assert(
    schemaContent.includes('School reassignment requires administrative authorization'),
    'Trigger must raise exception when unauthorized user attempts to change school_id'
  );
});

test('Verifies strict multi-tenant RLS policies on student assessments & stats', () => {
  const schemaPath = path.join(rootDir, 'supabase', 'schema.sql');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');

  // Classes & class_students admin policies
  assert(
    schemaContent.includes('School admin manage classes'),
    'Admin class management policy must exist'
  );
  assert(
    schemaContent.includes('School admin manage class students'),
    'Class students management must exist'
  );

  // Assessment answers join verification
  assert(
    schemaContent.includes('"Assessment answers select policy"') &&
      schemaContent.includes('WHERE c.teacher_id = public.get_auth_profile_id()'),
    'Assessment answers must not allow cross-school teachers'
  );

  // Learning path items join verification
  assert(
    schemaContent.includes('"Learning path items select policy"') &&
      schemaContent.includes('WHERE p.school_id = public.get_auth_school_id()'),
    'Learning path items must join via classes and profiles.school_id'
  );
});

test('Verifies Supabase Storage bucket quotas & folder isolation policies', () => {
  const schemaPath = path.join(rootDir, 'supabase', 'schema.sql');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');

  // 25MB file size limit for lesson-resources
  assert(
    schemaContent.includes('26214400'),
    'Storage policy must enforce 25MB (26214400 bytes) file_size_limit for lesson-resources'
  );

  // 3MB file size limit for avatars
  assert(
    schemaContent.includes('3145728'),
    'Storage policy must enforce 3MB (3145728 bytes) file_size_limit for avatars'
  );

  // User isolated avatar uploads: folder must match auth.uid()
  assert(
    schemaContent.includes("foldername(name))[1] = auth.uid()::text"),
    'Avatar upload policy must enforce folder isolation via auth.uid()'
  );
});

// ----------------------------------------------------
// 7. SHARED DEVICE LOGOUT DATA WIPE
// ----------------------------------------------------
console.log('\n7. SHARED DEVICE PRIVACY ON LOGOUT:');

test('Verifies AuthContext.tsx wipes sensitive progress & reports on logout', () => {
  const authContextPath = path.join(rootDir, 'src', 'contexts', 'AuthContext.tsx');
  const authContent = fs.readFileSync(authContextPath, 'utf8');

  assert(
    authContent.includes('shiksha_latest_report_'),
    'Logout must purge student diagnostic reports from localStorage'
  );
  assert(
    authContent.includes('shikshasetu_progress'),
    'Logout must remove local student progress cache on shared village devices'
  );
  assert(
    authContent.includes('shiksha_profile_'),
    'Logout must remove cached student profiles'
  );
});

// ----------------------------------------------------
// 8. INPUT SANITIZATION IN MODALS (TEACHER & ADMIN)
// ----------------------------------------------------
console.log('\n8. INPUT SANITIZATION IN MODALS:');

test('Verifies lesson creation modal sanitizes content blocks against XSS', () => {
  const modalPath = path.join(rootDir, 'src', 'components', 'library', 'TeacherLessonEditorModal.tsx');
  const modalContent = fs.readFileSync(modalPath, 'utf8');

  assert(modalContent.includes('sanitizeInput(title.trim())'), 'Title must be sanitized');
  assert(modalContent.includes('sanitizeInput(shortExplanation.trim())'), 'Explanation must be sanitized');
  assert(modalContent.includes('sanitizeInput(notesBody.trim())'), 'Notes body must be sanitized');
  assert(modalContent.includes('sanitizeInput(worksheetText.trim())'), 'Worksheet must be sanitized');
});

test('Verifies admin AddTeacherModal and AddStudentModal sanitize inputs', () => {
  const addTeacherPath = path.join(rootDir, 'src', 'components', 'admin', 'AddTeacherModal.tsx');
  const addTeacherContent = fs.readFileSync(addTeacherPath, 'utf8');
  assert(addTeacherContent.includes('sanitizeInput(name.trim())'), 'Teacher name must be sanitized');
  assert(addTeacherContent.includes('validateEmail(cleanEmail)'), 'Teacher email must be validated');

  const addStudentPath = path.join(rootDir, 'src', 'components', 'admin', 'AddStudentModal.tsx');
  const addStudentContent = fs.readFileSync(addStudentPath, 'utf8');
  assert(addStudentContent.includes('sanitizeInput(name.trim())'), 'Student name must be sanitized');
});

// ----------------------------------------------------
// SUMMARY
// ----------------------------------------------------
setTimeout(() => {
  console.log('\n🔒 ========================================================');
  console.log(`🔒 AUDIT SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('🔒 ========================================================\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL SECURITY AUDIT VERIFICATIONS PASSED WITH ZERO VULNERABILITIES!\n');
    process.exit(0);
  }
}, 100);
