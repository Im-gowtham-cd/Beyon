import fs from 'fs';
import path from 'path';

// Minimal valid 1-page PDF binary
function createMinimalPdf(title: string, text: string): Buffer {
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 200 >>
stream
BT
/F1 18 Tf
50 720 Td
(${title}) Tj
/F1 12 Tf
0 -30 Td
(${text}) Tj
0 -20 Td
(Verified by Beyon Academic Credential Network - Autonomous Verification Vault) Tj
0 -20 Td
(Issued to: Gowtham C D - Kongu Engineering College) Tj
0 -20 Td
(Digital Integrity Hash: SHA-256 Validated) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000224 00000 n 
0000000477 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
554
%%EOF`;
  return Buffer.from(content, 'utf-8');
}

// Minimal valid 1x1 PNG binary with green color
const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

async function main() {
  const targetDirs = [
    path.join(process.cwd(), 'backend', 'uploads', 'documents'),
    path.join(process.cwd(), 'uploads', 'documents'),
  ];

  const filesToGenerate = [
    {
      subDir: 'STUDENT_ID_CARD',
      fileName: '15fe2266_IMG20260912150510.jpg',
      content: TINY_PNG,
    },
    {
      subDir: 'RESUME',
      fileName: '08dc1da1_GOWTHAM_C_D.pdf',
      content: createMinimalPdf('GOWTHAM C D - Technical ATS Resume', 'Full-Stack Developer | Java, TypeScript, React, Spring Boot'),
    },
    {
      subDir: 'INTERNSHIP_CERTIFICATE',
      fileName: 'd919f195_4.png',
      content: TINY_PNG,
    },
    {
      subDir: 'ACADEMIC_RECORD',
      fileName: '10th_marksheet_gowtham.pdf',
      content: createMinimalPdf('Secondary School Examination Marksheet (10th Standard)', 'Kongu National Matriculation - Cumulative Aggregate: 94.6%'),
    },
    {
      subDir: 'ACADEMIC_RECORD',
      fileName: '12th_gradecard_gowtham.pdf',
      content: createMinimalPdf('Higher Secondary Examination Grade Card (12th Standard)', 'Kongu National Higher Secondary - Cumulative Aggregate: 95.2%'),
    },
  ];

  for (const base of targetDirs) {
    for (const f of filesToGenerate) {
      const dir = path.join(base, f.subDir);
      fs.mkdirSync(dir, { recursive: true });
      const filePath = path.join(dir, f.fileName);
      fs.writeFileSync(filePath, f.content);
      console.log(`Created: ${filePath}`);
    }
  }

  console.log('✅ Successfully generated all mock documents for preview testing.');
}

main().catch(console.error);
