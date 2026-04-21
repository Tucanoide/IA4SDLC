const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://checknewsai_user:whoknowswhatthefuck212!!@72.60.50.6:5434/ia4sdlc_cobolpoc'
});

async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}

run().catch(console.error);
