export interface InstitutionSeed {
  key: string;
  name: string;
  code: string;
  type: string;
  city: string;
  state: string;
  website: string;
  established: number;
  accreditation: string;
  accreditationGrade: string;
  placementRate: number;
  avgPackage: number;
  highestPackage: number;
  totalStudents: number;
  tier: "ELITE" | "STRONG" | "AVERAGE" | "WEAK" | "NEW";
  dataSource: "PUBLIC_REFERENCE" | "SYNTHETIC_DEMO";
}

export interface DepartmentSeed {
  code: string;
  name: string;
  shortName: string;
  programme: string;
  degree: string;
  description: string;
  targetStudents: number;
  hodName: string;
}

export const KEC_DEPARTMENTS: DepartmentSeed[] = [
  { code: "CSE", name: "Computer Science and Engineering", shortName: "CSE", programme: "B.E Computer Science and Engineering", degree: "B.E", description: "Department of Computer Science & Engineering with NBA tier-1 accreditation, AI/Cloud excellence centers", targetStudents: 80, hodName: "Dr. R. Thangarajan" },
  { code: "IT", name: "Information Technology", shortName: "IT", programme: "B.Tech Information Technology", degree: "B.Tech", description: "Department of Information Technology focusing on Cloud, Full-stack and Distributed Systems", targetStudents: 50, hodName: "Dr. S. Anandamurugan" },
  { code: "AIDS", name: "Artificial Intelligence and Data Science", shortName: "AI&DS", programme: "B.Tech Artificial Intelligence and Data Science", degree: "B.Tech", description: "Data science, Big data analytics and intelligent cognitive data systems", targetStudents: 35, hodName: "Dr. P. Natesan" },
  { code: "AIML", name: "Artificial Intelligence and Machine Learning", shortName: "AI&ML", programme: "B.Tech Artificial Intelligence and Machine Learning", degree: "B.Tech", description: "Deep learning, Neural networks, NLP and autonomous intelligence engineering", targetStudents: 30, hodName: "Dr. K. Sangeetha" },
  { code: "CSD", name: "Computer Science and Design", shortName: "CSD", programme: "B.E Computer Science and Design", degree: "B.E", description: "Computing systems, UI/UX architecture, Game design and interactive digital technology", targetStudents: 25, hodName: "Dr. N. Shanthi" },
  { code: "ECE", name: "Electronics and Communication Engineering", shortName: "ECE", programme: "B.E Electronics and Communication Engineering", degree: "B.E", description: "VLSI design, Embedded systems, Signal processing and wireless telecommunication", targetStudents: 60, hodName: "Dr. M. Joseph Auxilius Jude" },
  { code: "EEE", name: "Electrical and Electronics Engineering", shortName: "EEE", programme: "B.E Electrical and Electronics Engineering", degree: "B.E", description: "Smart grids, Power electronics, Electric vehicles and industrial automation drives", targetStudents: 40, hodName: "Dr. S. Albert Alexander" },
  { code: "MECH", name: "Mechanical Engineering", shortName: "MECH", programme: "B.E Mechanical Engineering", degree: "B.E", description: "Robotics, CAD/CAM/CAE, Thermal systems and Industry 4.0 manufacturing", targetStudents: 40, hodName: "Dr. R. Rajasekar" },
  { code: "MTS", name: "Mechatronics Engineering", shortName: "MTS", programme: "B.E Mechatronics Engineering", degree: "B.E", description: "Robotics, Automation, Sensors, Actuators and cyber-physical systems engineering", targetStudents: 20, hodName: "Dr. B. Meenakshipriya" },
  { code: "CIVIL", name: "Civil Engineering", shortName: "CIVIL", programme: "B.E Civil Engineering", degree: "B.E", description: "Structural engineering, Geotechnical, Environmental & smart city infrastructure", targetStudents: 20, hodName: "Dr. P. S. Kothai" },
  { code: "EIE", name: "Electronics and Instrumentation Engineering", shortName: "EIE", programme: "B.E Electronics and Instrumentation Engineering", degree: "B.E", description: "Process automation, Industrial instrumentation and IoT control systems", targetStudents: 15, hodName: "Dr. U. S. Ragupathy" },
  { code: "CHEM", name: "Chemical Engineering", shortName: "CHEM", programme: "B.Tech Chemical Engineering", degree: "B.Tech", description: "Process engineering, Reaction engineering and biochemical technologies", targetStudents: 15, hodName: "Dr. K. Kannan" },
  { code: "FOOD", name: "Food Technology", shortName: "FOOD", programme: "B.Tech Food Technology", degree: "B.Tech", description: "Food processing, Bioprocess engineering and quality assurance standards", targetStudents: 10, hodName: "Dr. R. Baskar" },
  { code: "AUTO", name: "Automobile Engineering", shortName: "AUTO", programme: "B.E Automobile Engineering", degree: "B.E", description: "Vehicle dynamics, Powertrain systems, EV battery tech and chassis design", targetStudents: 15, hodName: "Dr. C. Jegadheesan" },
];

export const INSTITUTIONS: InstitutionSeed[] = [
  {
    key: "INST_KEC",
    name: "Kongu Engineering College",
    code: "1-4251711",
    type: "Autonomous Engineering College",
    city: "Perundurai",
    state: "Tamil Nadu",
    website: "https://kongu.ac.in/",
    established: 1984,
    accreditation: "NAAC A++, NBA Tier-1, AICTE Approved, Autonomous",
    accreditationGrade: "A++",
    placementRate: 94.2,
    avgPackage: 6.2,
    highestPackage: 40.0,
    totalStudents: 8500,
    tier: "ELITE",
    dataSource: "PUBLIC_REFERENCE",
  },
  {
    key: "INST_0001",
    name: "Beyon Institute of Technology",
    code: "BIT001",
    type: "Engineering College",
    city: "Chennai",
    state: "Tamil Nadu",
    website: "https://bit.beyon.test",
    established: 1995,
    accreditation: "NAAC",
    accreditationGrade: "A++",
    placementRate: 94.2,
    avgPackage: 12.5,
    highestPackage: 48.0,
    totalStudents: 4200,
    tier: "ELITE",
    dataSource: "SYNTHETIC_DEMO",
  },
  {
    key: "INST_0002",
    name: "Apex College of Engineering",
    code: "ACE001",
    type: "Engineering College",
    city: "Bangalore",
    state: "Karnataka",
    website: "https://ace.beyon.test",
    established: 1990,
    accreditation: "NAAC",
    accreditationGrade: "A+",
    placementRate: 91.8,
    avgPackage: 10.8,
    highestPackage: 42.0,
    totalStudents: 3800,
    tier: "ELITE",
    dataSource: "SYNTHETIC_DEMO",
  },
];

export const DEPARTMENTS_PER_INSTITUTION = KEC_DEPARTMENTS.map((d) => d.code);


