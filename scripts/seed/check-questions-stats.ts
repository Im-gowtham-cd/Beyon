import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'beyon'
  });

  const [countRes]: any = await conn.query('SELECT count(*) as total, sum(case when difficulty in ("EASY", "BEGINNER") then 1 else 0 end) as easy, sum(case when difficulty in ("MEDIUM", "INTERMEDIATE") then 1 else 0 end) as medium, sum(case when difficulty in ("HARD", "ADVANCED", "EXPERT") then 1 else 0 end) as hard FROM questions');
  console.log('Real Stats:', countRes[0]);

  const [skills]: any = await conn.query('SELECT id, name, slug, category FROM skills LIMIT 25');
  console.log('Sample Skills in DB:', skills);

  const [tagSample]: any = await conn.query('SELECT distinct substring_index(tags, ",", 1) as main_tag, count(*) as count FROM questions WHERE tags is not null GROUP BY main_tag ORDER BY count DESC LIMIT 40');
  console.log('Top tags in questions:', tagSample);

  const [types]: any = await conn.query('SELECT question_type, count(*) as count FROM questions GROUP BY question_type');
  console.log('Question types:', types);

  const testCategories = ['Java', 'Angular', 'React', 'DSA', 'Python', 'SQL', 'System Design', 'Mobile'];
  for (const cat of testCategories) {
    let whereClause = '';
    if (cat === 'Java') whereClause = "(LOWER(tags) LIKE '%java%' OR LOWER(tags) LIKE '%spring%' OR LOWER(title) LIKE '%java%')";
    if (cat === 'Angular') whereClause = "(LOWER(tags) LIKE '%angular%' OR LOWER(title) LIKE '%angular%')";
    if (cat === 'React') whereClause = "(LOWER(tags) LIKE '%react%' OR LOWER(tags) LIKE '%next%' OR LOWER(title) LIKE '%react%')";
    if (cat === 'DSA') whereClause = "(LOWER(tags) LIKE '%algorithm%' OR LOWER(tags) LIKE '%data structures%' OR LOWER(tags) LIKE '%dsa%' OR LOWER(title) LIKE '%dsa%' OR LOWER(title) LIKE '%algorithm%')";
    if (cat === 'Python') whereClause = "(LOWER(tags) LIKE '%python%' OR LOWER(tags) LIKE '%django%' OR LOWER(tags) LIKE '%fastapi%' OR LOWER(tags) LIKE '%machine learning%' OR LOWER(tags) LIKE '%deep learning%' OR LOWER(title) LIKE '%python%')";
    if (cat === 'SQL') whereClause = "(LOWER(tags) LIKE '%sql%' OR LOWER(tags) LIKE '%mysql%' OR LOWER(tags) LIKE '%postgres%' OR LOWER(tags) LIKE '%mongodb%' OR LOWER(tags) LIKE '%database%' OR LOWER(tags) LIKE '%dbms%' OR question_type = 'SQL')";
    if (cat === 'System Design') whereClause = "(LOWER(tags) LIKE '%system design%' OR LOWER(tags) LIKE '%devops%' OR LOWER(tags) LIKE '%docker%' OR LOWER(tags) LIKE '%kubernetes%' OR LOWER(tags) LIKE '%linux%' OR LOWER(tags) LIKE '%cloud%' OR LOWER(tags) LIKE '%aws%' OR LOWER(title) LIKE '%system design%')";
    if (cat === 'Mobile') whereClause = "(LOWER(tags) LIKE '%flutter%' OR LOWER(tags) LIKE '%react native%' OR LOWER(tags) LIKE '%mobile%' OR LOWER(tags) LIKE '%android%' OR LOWER(tags) LIKE '%ios%')";

    const [c]: any = await conn.query(`SELECT count(*) as count FROM questions WHERE (status = 'PUBLISHED' OR status = 'ACTIVE') AND ${whereClause}`);
    console.log(`Category [${cat}] Count:`, c[0].count);
  }

  await conn.end();
}

main().catch(console.error);
