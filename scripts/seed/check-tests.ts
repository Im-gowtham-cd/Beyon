import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'beyon'
  });

  const [tests]: any = await conn.query('SELECT * FROM tests');
  console.log('Tests count:', tests.length);
  console.log(tests);

  await conn.end();
}

main().catch(console.error);
