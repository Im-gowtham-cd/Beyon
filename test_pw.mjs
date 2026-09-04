import bcrypt from './scripts/seed/node_modules/bcryptjs/index.js';
const target = '$2a$10$ia9dv3k4shn0nkLZ1Pq9KePS6QC/eND60jZ3fMY/cxSEvHsD0BBaW';

const baseWords = [
  '9003538951', '23CSR068', '23csr068', 'gowtham', 'Gowtham', 'GOWTHAM',
  'gowthamcd', 'Gowthamcd', 'GowthamCD', 'Gowtham C D', 'gowtham c d',
  'karur', 'Karur', 'KARUR', 'tamilnadu', 'Tamilnadu',
  'kec', 'KEC', 'kongu', 'Kongu', 'cse', 'CSE',
  'beyon', 'Beyon', 'BEYON', 'student', 'Student',
  'studies', 'gowthamcdstudies'
];

const candidateList = new Set();
for (const b of baseWords) {
  candidateList.add(b);
  for (const s of ['', '1', '12', '123', '@123', '#123', '!123', '1234', '12345', '2023', '2024', '2025', '2026', '@2026', '#2026', '!2026', '@2025', '@2024', '@2023', '@', '#', '!', '.', '_']) {
    candidateList.add(b + s);
    candidateList.add(s + b);
  }
}

// Also combinations like gowtham@9003538951, 23CSR068@kec, etc.
candidateList.add('9003538951');
candidateList.add('gowtham@9003538951');
candidateList.add('Gowtham@9003538951');
candidateList.add('gowtham23CSR068');
candidateList.add('Gowtham23CSR068');
candidateList.add('23CSR068@2026');
candidateList.add('23CSR068@kec');
candidateList.add('23csr068@kec');
candidateList.add('Kec@23CSR068');
candidateList.add('Kongu@123');
candidateList.add('Kongu@2026');
candidateList.add('Karur@123');
candidateList.add('Karur@2026');
candidateList.add('Gowtham@Karur');
candidateList.add('gowtham@karur');

console.log(`Checking ${candidateList.size} candidates...`);
let found = null;
for (const c of candidateList) {
  if (bcrypt.compareSync(c, target)) {
    found = c;
    break;
  }
}
if (found) {
  console.log('>>> MATCH FOUND! Password is:', found);
} else {
  console.log('No match found in targeted list.');
}
