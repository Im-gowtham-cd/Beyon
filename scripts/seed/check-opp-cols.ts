import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'beyon'
  });

  const [cols]: any = await conn.query('DESC company_opportunities');
  console.log('company_opportunities columns:', cols.map((c: any) => `${c.Field} (${c.Type})`));

  await conn.end();
}

main().catch(console.error);
