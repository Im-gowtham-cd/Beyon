// ============================================================
// Beyon Seed — Static Institution Data (25 fictional institutions)
// ============================================================

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
}

export const INSTITUTIONS: InstitutionSeed[] = [
  // ELITE (5)
  { key: "INST_0001", name: "Beyon Institute of Technology", code: "BIT001", type: "Engineering College", city: "Chennai", state: "Tamil Nadu", website: "https://bit.beyon.test", established: 1995, accreditation: "NAAC", accreditationGrade: "A++", placementRate: 94.2, avgPackage: 12.5, highestPackage: 48.0, totalStudents: 4200, tier: "ELITE" },
  { key: "INST_0002", name: "Apex College of Engineering", code: "ACE001", type: "Engineering College", city: "Bangalore", state: "Karnataka", website: "https://ace.beyon.test", established: 1990, accreditation: "NAAC", accreditationGrade: "A+", placementRate: 91.8, avgPackage: 10.8, highestPackage: 42.0, totalStudents: 3800, tier: "ELITE" },
  { key: "INST_0003", name: "National Institute of Applied Sciences", code: "NIAS001", type: "Institute of Technology", city: "Hyderabad", state: "Andhra Pradesh", website: "https://nias.beyon.test", established: 1988, accreditation: "NAAC", accreditationGrade: "A+", placementRate: 89.5, avgPackage: 11.2, highestPackage: 45.0, totalStudents: 5000, tier: "ELITE" },
  { key: "INST_0004", name: "Premier School of Computing", code: "PSC001", type: "College of Technology", city: "Pune", state: "Maharashtra", website: "https://psc.beyon.test", established: 1992, accreditation: "NAAC", accreditationGrade: "A", placementRate: 87.4, avgPackage: 9.6, highestPackage: 36.0, totalStudents: 3200, tier: "ELITE" },
  { key: "INST_0005", name: "Vega University of Engineering", code: "VUE001", type: "University", city: "Coimbatore", state: "Tamil Nadu", website: "https://vue.beyon.test", established: 1985, accreditation: "NAAC", accreditationGrade: "A", placementRate: 85.0, avgPackage: 8.9, highestPackage: 32.0, totalStudents: 6000, tier: "ELITE" },
  // STRONG (7)
  { key: "INST_0006", name: "Zenith College of Engineering", code: "ZCE001", type: "Engineering College", city: "Chennai", state: "Tamil Nadu", website: "https://zce.beyon.test", established: 2000, accreditation: "NAAC", accreditationGrade: "A", placementRate: 78.3, avgPackage: 7.2, highestPackage: 28.0, totalStudents: 2800, tier: "STRONG" },
  { key: "INST_0007", name: "Nexus Institute of Technology", code: "NIT001", type: "Engineering College", city: "Madurai", state: "Tamil Nadu", website: "https://nit.beyon.test", established: 1998, accreditation: "NAAC", accreditationGrade: "B+", placementRate: 75.1, avgPackage: 6.8, highestPackage: 24.0, totalStudents: 2400, tier: "STRONG" },
  { key: "INST_0008", name: "Horizon Institute of Science", code: "HIS001", type: "Autonomous College", city: "Trichy", state: "Tamil Nadu", website: "https://his.beyon.test", established: 2001, accreditation: "NAAC", accreditationGrade: "B+", placementRate: 72.8, avgPackage: 6.2, highestPackage: 22.0, totalStudents: 2200, tier: "STRONG" },
  { key: "INST_0009", name: "Prism College of Technology", code: "PCT001", type: "Engineering College", city: "Mysore", state: "Karnataka", website: "https://pct.beyon.test", established: 2003, accreditation: "NAAC", accreditationGrade: "B+", placementRate: 70.4, avgPackage: 6.0, highestPackage: 20.0, totalStudents: 1800, tier: "STRONG" },
  { key: "INST_0010", name: "Skyline College of Engineering", code: "SCE001", type: "Engineering College", city: "Salem", state: "Tamil Nadu", website: "https://sce.beyon.test", established: 2002, accreditation: "NAAC", accreditationGrade: "B", placementRate: 68.9, avgPackage: 5.8, highestPackage: 18.0, totalStudents: 1600, tier: "STRONG" },
  { key: "INST_0011", name: "Sigma Institute of Applied Technology", code: "SIAT001", type: "Engineering College", city: "Visakhapatnam", state: "Andhra Pradesh", website: "https://siat.beyon.test", established: 1999, accreditation: "NAAC", accreditationGrade: "B+", placementRate: 74.2, avgPackage: 6.5, highestPackage: 23.0, totalStudents: 2100, tier: "STRONG" },
  { key: "INST_0012", name: "Pinnacle School of Engineering", code: "PSE001", type: "Engineering College", city: "Erode", state: "Tamil Nadu", website: "https://pse.beyon.test", established: 2004, accreditation: "NAAC", accreditationGrade: "B", placementRate: 66.1, avgPackage: 5.5, highestPackage: 16.0, totalStudents: 1400, tier: "STRONG" },
  // AVERAGE (8)
  { key: "INST_0013", name: "Orbit College of Engineering", code: "OCE001", type: "Engineering College", city: "Tiruppur", state: "Tamil Nadu", website: "https://oce.beyon.test", established: 2006, accreditation: "NAAC", accreditationGrade: "B", placementRate: 58.4, avgPackage: 4.8, highestPackage: 14.0, totalStudents: 1200, tier: "AVERAGE" },
  { key: "INST_0014", name: "Pioneer Institute of Computing", code: "PIC001", type: "Engineering College", city: "Vellore", state: "Tamil Nadu", website: "https://pic.beyon.test", established: 2005, accreditation: "NAAC", accreditationGrade: "B", placementRate: 55.7, avgPackage: 4.5, highestPackage: 12.0, totalStudents: 1100, tier: "AVERAGE" },
  { key: "INST_0015", name: "Vector College of Technology", code: "VCT001", type: "Engineering College", city: "Hubli", state: "Karnataka", website: "https://vct.beyon.test", established: 2007, accreditation: "NAAC", accreditationGrade: "B", placementRate: 52.1, avgPackage: 4.2, highestPackage: 11.0, totalStudents: 950, tier: "AVERAGE" },
  { key: "INST_0016", name: "Radiant Institute of Engineering", code: "RIE001", type: "Engineering College", city: "Guntur", state: "Andhra Pradesh", website: "https://rie.beyon.test", established: 2008, accreditation: "NAAC", accreditationGrade: "B", placementRate: 50.0, avgPackage: 4.0, highestPackage: 10.0, totalStudents: 900, tier: "AVERAGE" },
  { key: "INST_0017", name: "Quantum College of Engineering", code: "QCE001", type: "Engineering College", city: "Belgaum", state: "Karnataka", website: "https://qce.beyon.test", established: 2006, accreditation: "NAAC", accreditationGrade: "C", placementRate: 48.3, avgPackage: 3.8, highestPackage: 9.5, totalStudents: 850, tier: "AVERAGE" },
  { key: "INST_0018", name: "Matrix Institute of Technology", code: "MIT001", type: "Engineering College", city: "Tirupati", state: "Andhra Pradesh", website: "https://mit.beyon.test", established: 2009, accreditation: "NAAC", accreditationGrade: "C", placementRate: 46.5, avgPackage: 3.6, highestPackage: 9.0, totalStudents: 800, tier: "AVERAGE" },
  { key: "INST_0019", name: "Luminary School of Computing", code: "LSC001", type: "Autonomous College", city: "Mangalore", state: "Karnataka", website: "https://lsc.beyon.test", established: 2010, accreditation: "NAAC", accreditationGrade: "C", placementRate: 44.2, avgPackage: 3.4, highestPackage: 8.5, totalStudents: 750, tier: "AVERAGE" },
  { key: "INST_0020", name: "Pulse College of Engineering", code: "PCE001", type: "Engineering College", city: "Vijayawada", state: "Andhra Pradesh", website: "https://pce.beyon.test", established: 2008, accreditation: "NAAC", accreditationGrade: "C", placementRate: 42.8, avgPackage: 3.2, highestPackage: 8.0, totalStudents: 700, tier: "AVERAGE" },
  // WEAK (3)
  { key: "INST_0021", name: "Ember Institute of Technology", code: "EIT001", type: "Engineering College", city: "Chennai", state: "Tamil Nadu", website: "https://eit.beyon.test", established: 2012, accreditation: "NAAC", accreditationGrade: "C", placementRate: 32.1, avgPackage: 2.8, highestPackage: 6.0, totalStudents: 500, tier: "WEAK" },
  { key: "INST_0022", name: "Crescent School of Technology", code: "CST001", type: "Engineering College", city: "Coimbatore", state: "Tamil Nadu", website: "https://cst.beyon.test", established: 2013, accreditation: "NAAC", accreditationGrade: "C", placementRate: 28.4, avgPackage: 2.5, highestPackage: 5.5, totalStudents: 420, tier: "WEAK" },
  { key: "INST_0023", name: "Ridge College of Engineering", code: "RCE001", type: "Engineering College", city: "Madurai", state: "Tamil Nadu", website: "https://rce.beyon.test", established: 2014, accreditation: "NAAC", accreditationGrade: "C", placementRate: 24.7, avgPackage: 2.2, highestPackage: 5.0, totalStudents: 380, tier: "WEAK" },
  // NEW / UNVERIFIED (2)
  { key: "INST_0024", name: "Nova Institute of Computing", code: "NIC001", type: "Engineering College", city: "Bangalore", state: "Karnataka", website: "https://nic.beyon.test", established: 2020, accreditation: "NAAC", accreditationGrade: "PENDING", placementRate: 15.0, avgPackage: 2.0, highestPackage: 4.5, totalStudents: 200, tier: "NEW" },
  { key: "INST_0025", name: "Dawn College of Technology", code: "DCT001", type: "Engineering College", city: "Hyderabad", state: "Andhra Pradesh", website: "https://dct.beyon.test", established: 2022, accreditation: "NAAC", accreditationGrade: "PENDING", placementRate: 0.0, avgPackage: 0.0, highestPackage: 0.0, totalStudents: 150, tier: "NEW" },
];

export const DEPARTMENTS_PER_INSTITUTION = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "AIDS", "AIML"];
