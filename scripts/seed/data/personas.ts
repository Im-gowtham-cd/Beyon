// ============================================================
// Beyon Seed — Fixed Test Account Definitions
// ============================================================

export interface TestAccount {
  id: string;           // Deterministic Appwrite user ID (for idempotency)
  email: string;
  password: string;
  name: string;
  role: string;
  status: string;
  emailVerified: boolean;
  institutionKey?: string;
  companyKey?: string;
  persona?: "A" | "B" | "C" | "D";  // Student persona type
  extraData?: Record<string, any>;
}

export const FIXED_ACCOUNTS: TestAccount[] = [
  // ─── Platform Admins ───
  {
    id: "beyon-superadmin-0001",
    email: "superadmin@example.beyon.test",
    password: "BeyonTest!2026#Super",
    name: "Super Administrator",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    emailVerified: true,
  },
  {
    id: "beyon-admin-0001",
    email: "admin@example.beyon.test",
    password: "BeyonTest!2026#Admin",
    name: "Platform Administrator",
    role: "ADMIN",
    status: "ACTIVE",
    emailVerified: true,
  },
  {
    id: "beyon-moderator-0001",
    email: "moderator@example.beyon.test",
    password: "BeyonTest!2026#Moderator",
    name: "Content Moderator",
    role: "MODERATOR",
    status: "ACTIVE",
    emailVerified: true,
  },
  // ─── Students ───
  {
    id: "beyon-student-strong-0001",
    email: "student.strong@example.beyon.test",
    password: "BeyonTest!2026#Student1",
    name: "Arjun Kumar",
    role: "STUDENT",
    status: "ACTIVE",
    emailVerified: true,
    institutionKey: "INST_0001",
    persona: "A",
    extraData: { cgpa: 9.1, coins: 2450, placement_preference: "PLACEMENT_WILLING", department: "CSE", graduation_year: 2026 },
  },
  {
    id: "beyon-student-weak-0001",
    email: "student.weak@example.beyon.test",
    password: "BeyonTest!2026#Student2",
    name: "Ravi Shankar",
    role: "STUDENT",
    status: "ACTIVE",
    emailVerified: true,
    institutionKey: "INST_0013",
    persona: "C",
    extraData: { cgpa: 6.4, coins: 80, placement_preference: "PLACEMENT_WILLING", department: "IT", graduation_year: 2026 },
  },
  {
    id: "beyon-student-placement-0001",
    email: "student.placement@example.beyon.test",
    password: "BeyonTest!2026#Student3",
    name: "Priya Nair",
    role: "STUDENT",
    status: "ACTIVE",
    emailVerified: true,
    institutionKey: "INST_0002",
    persona: "B",
    extraData: { cgpa: 7.6, coins: 420, placement_preference: "PLACEMENT_WILLING", department: "CSE", graduation_year: 2027 },
  },
  {
    id: "beyon-student-independent-0001",
    email: "student.independent@example.beyon.test",
    password: "BeyonTest!2026#Student4",
    name: "Vikram Reddy",
    role: "STUDENT",
    status: "ACTIVE",
    emailVerified: true,
    institutionKey: "INST_0003",
    persona: "D",
    extraData: { cgpa: 8.3, coins: 730, placement_preference: "NOT_SEEKING_PLACEMENT", department: "ECE", graduation_year: 2027 },
  },
  {
    id: "beyon-student-incomplete-0001",
    email: "student.incomplete@example.beyon.test",
    password: "BeyonTest!2026#Student5",
    name: "Sneha Pillai",
    role: "STUDENT",
    status: "ACTIVE",
    emailVerified: false,  // Deliberately unverified
    institutionKey: "INST_0006",
    persona: "B",
    extraData: { cgpa: null, coins: 0, placement_preference: null, department: null, graduation_year: null },
  },
  // ─── Exam Candidates ───
  {
    id: "beyon-exam-candidate-0001",
    email: "exam.candidate1@example.beyon.test",
    password: "BeyonTest!2026#Exam1",
    name: "Exam Candidate Alpha",
    role: "STUDENT",
    status: "ACTIVE",
    emailVerified: true,
    institutionKey: "INST_0001",
    persona: "A",
    extraData: { cgpa: 8.8, coins: 1000, assessment_state: "READY", placement_preference: "PLACEMENT_WILLING", department: "CSE", graduation_year: 2026 },
  },
  {
    id: "beyon-exam-candidate-0002",
    email: "exam.candidate2@example.beyon.test",
    password: "BeyonTest!2026#Exam2",
    name: "Exam Candidate Beta",
    role: "STUDENT",
    status: "ACTIVE",
    emailVerified: true,
    institutionKey: "INST_0013",
    persona: "C",
    extraData: { cgpa: 5.8, coins: 1000, assessment_state: "BLOCKED", placement_preference: "PLACEMENT_WILLING", department: "IT", graduation_year: 2026 },
  },
  {
    id: "beyon-exam-candidate-0003",
    email: "exam.candidate3@example.beyon.test",
    password: "BeyonTest!2026#Exam3",
    name: "Exam Candidate Gamma",
    role: "STUDENT",
    status: "ACTIVE",
    emailVerified: true,
    institutionKey: "INST_0002",
    persona: "B",
    extraData: { cgpa: 7.9, coins: 50, assessment_state: "INSUFFICIENT_COINS", placement_preference: "PLACEMENT_WILLING", department: "CSE", graduation_year: 2027 },
  },
  {
    id: "beyon-exam-candidate-0004",
    email: "exam.candidate4@example.beyon.test",
    password: "BeyonTest!2026#Exam4",
    name: "Exam Candidate Delta",
    role: "STUDENT",
    status: "ACTIVE",
    emailVerified: true,
    institutionKey: "INST_0001",
    persona: "A",
    extraData: { cgpa: 8.5, coins: 1000, assessment_state: "IN_PROGRESS", placement_preference: "PLACEMENT_WILLING", department: "CSE", graduation_year: 2026 },
  },
  {
    id: "beyon-exam-candidate-0005",
    email: "exam.candidate5@example.beyon.test",
    password: "BeyonTest!2026#Exam5",
    name: "Exam Candidate Epsilon",
    role: "STUDENT",
    status: "ACTIVE",
    emailVerified: true,
    institutionKey: "INST_0002",
    persona: "B",
    extraData: { cgpa: 8.1, coins: 1000, assessment_state: "SUBMITTED", placement_preference: "PLACEMENT_WILLING", department: "IT", graduation_year: 2027 },
  },
  // ─── Company Accounts ───
  {
    id: "beyon-recruiter-0001",
    email: "recruiter@example.beyon.test",
    password: "BeyonTest!2026#Recruiter",
    name: "Rajesh Mehta",
    role: "COMPANY_RECRUITER",
    status: "ACTIVE",
    emailVerified: true,
    companyKey: "COMP_0001",
  },
  {
    id: "beyon-company-admin-0001",
    email: "company.admin@example.beyon.test",
    password: "BeyonTest!2026#Company",
    name: "Company Administrator",
    role: "COMPANY_ADMIN",
    status: "ACTIVE",
    emailVerified: true,
    companyKey: "COMP_0001",
  },
  // ─── Institution Accounts ───
  {
    id: "beyon-inst-admin-0001",
    email: "institution.admin@example.beyon.test",
    password: "BeyonTest!2026#Institution",
    name: "Institution Admin",
    role: "INSTITUTION_ADMIN",
    status: "ACTIVE",
    emailVerified: true,
    institutionKey: "INST_0001",
  },
  {
    id: "beyon-placement-0001",
    email: "placement@example.beyon.test",
    password: "BeyonTest!2026#Placement",
    name: "Placement Officer",
    role: "PLACEMENT_OFFICER",
    status: "ACTIVE",
    emailVerified: true,
    institutionKey: "INST_0001",
  },
  {
    id: "beyon-faculty-0001",
    email: "faculty@example.beyon.test",
    password: "BeyonTest!2026#Faculty",
    name: "Dr. Kavitha Iyer",
    role: "FACULTY",
    status: "ACTIVE",
    emailVerified: true,
    institutionKey: "INST_0001",
  },
  // ─── Mentor / Alumni ───
  {
    id: "beyon-mentor-0001",
    email: "mentor@example.beyon.test",
    password: "BeyonTest!2026#Mentor",
    name: "Siddharth Varma",
    role: "MENTOR",
    status: "ACTIVE",
    emailVerified: true,
  },
  {
    id: "beyon-alumni-0001",
    email: "alumni@example.beyon.test",
    password: "BeyonTest!2026#Alumni",
    name: "Karthik Murthy",
    role: "ALUMNI",
    status: "ACTIVE",
    emailVerified: true,
    institutionKey: "INST_0001",
  },
];

// All student roles for convenience
export const STUDENT_ROLES = ["STUDENT"];

// Roles that need institution_id
export const INSTITUTION_ROLES = ["INSTITUTION_ADMIN", "PLACEMENT_OFFICER", "FACULTY", "STUDENT", "ALUMNI"];

// Roles that need company_id
export const COMPANY_ROLES = ["COMPANY_RECRUITER", "COMPANY_ADMIN"];
