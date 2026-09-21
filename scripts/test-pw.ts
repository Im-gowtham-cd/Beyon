import bcrypt from 'bcryptjs';

const hash = '$2b$10$s3855CduR4SV7tOdnQB0BObl.fIaBDOkvW7PJZWvh27Lv5pK3sLYO';

const candidates = [
  'Password@123',
  'password',
  'Admin@123',
  'gowtham',
  'Gowtham@123',
  'Superadmin@2026',
  'Verifier@2026',
  'password123',
  '12345678',
  'admin',
  'beyon@123',
  'Beyon@2026'
];

for (const p of candidates) {
  const match = bcrypt.compareSync(p, hash);
  if (match) {
    console.log(`MATCH FOUND: "${p}"`);
  }
}
