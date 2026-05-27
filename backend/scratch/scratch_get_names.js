import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'EchoesofNepal',
  password: 'root',
  port: 5432,
});

async function run() {
  try {
    const res = await pool.query('SELECT name FROM destinations UNION SELECT name FROM treks');
    console.log(JSON.stringify(res.rows.map(r => r.name)));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
