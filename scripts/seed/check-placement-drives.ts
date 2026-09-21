import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'beyon'
  });

  const [cols]: any = await conn.query('DESC placement_drives');
  console.log('placement_drives columns:', cols.map((c: any) => `${c.Field} (${c.Type})`));

  const [rows]: any = await conn.query("SELECT * FROM placement_drives LIMIT 5");
  console.log('placement_drives sample:', rows);

  await conn.end();
}

main().catch(console.error);
