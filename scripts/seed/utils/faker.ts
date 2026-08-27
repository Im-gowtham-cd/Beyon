// ============================================================
// Beyon Seed — Deterministic Pseudo-Random Number Generator
// Uses a seeded LCG so results are reproducible given same seed
// ============================================================

export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  /** Returns float in [0, 1) */
  next(): number {
    // LCG parameters (Numerical Recipes)
    this.state = (Math.imul(1664525, this.state) + 1013904223) >>> 0;
    return this.state / 0x100000000;
  }

  /** Returns integer in [min, max] inclusive */
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** Returns float in [min, max) */
  float(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /** Pick random element from array */
  pick<T>(arr: T[]): T {
    return arr[this.int(0, arr.length - 1)];
  }

  /** Pick N unique elements from array */
  pickN<T>(arr: T[], n: number): T[] {
    const copy = [...arr];
    const result: T[] = [];
    const count = Math.min(n, copy.length);
    for (let i = 0; i < count; i++) {
      const idx = this.int(0, copy.length - 1);
      result.push(copy[idx]);
      copy.splice(idx, 1);
    }
    return result;
  }

  /** Shuffle array in-place */
  shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /** Boolean with given probability (0-1) */
  bool(probability = 0.5): boolean {
    return this.next() < probability;
  }
}

// ─── Fake Data Helpers ────────────────────────────────────────

const FIRST_NAMES = [
  "Aarav", "Arjun", "Vikram", "Rahul", "Karthik", "Siddharth", "Rohan", "Aditya",
  "Priya", "Ananya", "Divya", "Kavya", "Pooja", "Sneha", "Meera", "Lakshmi",
  "Mohammed", "Faisal", "Zaid", "Ibrahim", "Hassan", "Ali", "Omar", "Yusuf",
  "Ravi", "Suresh", "Ganesh", "Mohan", "Ramesh", "Dinesh", "Vijay", "Kumar",
  "Akash", "Nikhil", "Deepak", "Manish", "Rajesh", "Amit", "Naveen", "Santhosh",
  "Keerthi", "Nithya", "Pavithra", "Saranya", "Vaishnavi", "Harini", "Mythili", "Geetha",
  "Ajay", "Vijayalakshmi", "Bharath", "Saravanan", "Muthu", "Selvam", "Senthil", "Prabhu",
  "Emile", "José", "Surya", "Nandhini", "Lavanya", "Abinaya", "Suganya", "Kanimozhi",
];

const LAST_NAMES = [
  "Kumar", "Sharma", "Singh", "Patel", "Gupta", "Reddy", "Rao", "Nair",
  "Krishnan", "Pillai", "Iyer", "Naidu", "Menon", "Murthy", "Rajan", "Varma",
  "Shah", "Mehta", "Joshi", "Verma", "Sinha", "Tiwari", "Dubey", "Mishra",
  "Chowdhury", "Das", "Ghosh", "Bose", "Mukherjee", "Chatterjee", "Banerjee", "Roy",
  "Nadar", "Thevar", "Gounder", "Mudaliar", "Chettiar", "Pillai", "Venkatesan", "Sundaram",
  "Laurent", "Martínez", "Ali", "Khan", "Ahmed", "Rahman", "Hussain", "Malik",
];

const CITIES_TN = ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Erode", "Tiruppur", "Vellore"];
const CITIES_KA = ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum"];
const CITIES_AP = ["Hyderabad", "Visakhapatnam", "Vijayawada", "Guntur", "Tirupati"];
const ALL_CITIES = [...CITIES_TN, ...CITIES_KA, ...CITIES_AP, "Pune", "Mumbai", "Delhi", "Kolkata", "Jaipur"];

const STATES = [
  { state: "Tamil Nadu", cities: CITIES_TN },
  { state: "Karnataka", cities: CITIES_KA },
  { state: "Andhra Pradesh", cities: CITIES_AP },
  { state: "Maharashtra", cities: ["Pune", "Mumbai", "Nagpur"] },
  { state: "Delhi", cities: ["Delhi", "New Delhi"] },
];

export function makeName(rng: SeededRandom): { first: string; last: string; full: string } {
  const first = rng.pick(FIRST_NAMES);
  const last = rng.pick(LAST_NAMES);
  return { first, last, full: `${first} ${last}` };
}

export function makeLocation(rng: SeededRandom): { city: string; state: string; country: string } {
  const s = rng.pick(STATES);
  return { city: rng.pick(s.cities), state: s.state, country: "India" };
}

export function makePhone(rng: SeededRandom, index: number): string {
  return `+919${String(800000000 + index).slice(0, 9)}`;
}

export function makeEmailSlug(name: string, index: number): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 15) + index;
}

const DEGREE_TYPES = ["B.Tech", "B.E", "B.Sc", "MCA", "M.Tech", "MBA"];
const DEPARTMENTS = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "AIDS", "AIML", "CYS", "CSBS"];
const WORK_TYPES = ["REMOTE", "HYBRID", "ONSITE"];
const PLACEMENT_PREFS = ["PLACEMENT_WILLING", "PLACEMENT_WILLING", "PLACEMENT_WILLING", "NOT_SEEKING_PLACEMENT"];
const GENDERS = ["MALE", "FEMALE", "PREFER_NOT_TO_SAY"];

export function makeStudentAcademics(rng: SeededRandom, personaType: string) {
  const base = {
    A: { cgpa: rng.float(8.5, 9.9), grad: 2026 },
    B: { cgpa: rng.float(7.0, 8.4), grad: 2027 },
    C: { cgpa: rng.float(5.5, 6.9), grad: 2026 },
    D: { cgpa: rng.float(7.5, 8.8), grad: 2027 },
  }[personaType] ?? { cgpa: rng.float(6.0, 9.0), grad: 2027 };

  return {
    degree: rng.pick(DEGREE_TYPES),
    department: rng.pick(DEPARTMENTS),
    graduationYear: base.grad,
    cgpa: Math.round(base.cgpa * 100) / 100,
    academicYear: rng.pick(["1st Year", "2nd Year", "3rd Year", "4th Year"]),
    placementPreference: personaType === "D" ? "NOT_SEEKING_PLACEMENT" : "PLACEMENT_WILLING",
    workType: rng.pick(WORK_TYPES),
  };
}

export function makeCoins(rng: SeededRandom, personaType: string): number {
  return {
    A: rng.int(1500, 3000),
    B: rng.int(300, 800),
    C: rng.int(50, 300),
    D: rng.int(500, 1500),
  }[personaType] ?? rng.int(100, 1000);
}

export { DEPARTMENTS, WORK_TYPES, GENDERS };
