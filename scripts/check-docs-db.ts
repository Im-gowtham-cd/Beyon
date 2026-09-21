import mysql from 'mysql2/promise';

async function main() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'beyon',
  });

  const [profiles] = await connection.query('SELECT user_id, resume_url, student_id_card_url, internship_experience, education_10th, education_12th FROM student_profiles LIMIT 5');
  console.log('--- student_profiles ---');
  console.log(JSON.stringify(profiles, null, 2));

  const [files] = await connection.query('SELECT id, user_id, file_type, original_name, storage_path, mime_type, file_size FROM file_documents LIMIT 10');
  console.log('--- file_documents ---');
  console.log(JSON.stringify(files, null, 2));

  await connection.end();
}

main().catch(console.error);
