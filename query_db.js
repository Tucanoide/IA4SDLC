const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://checknewsai_user:whoknowswhatthefuck212!!@72.60.50.6:5434/ia4sdlc_cobolpoc'
});

async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT column_name, data_type, character_maximum_length, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'cobol_analysys' AND table_name = 'programs';
  `);
  console.log(JSON.stringify(res.rows, null, 2));

  // Also let's check primary keys/constraints
  const keys = await client.query(`
    SELECT
        kcu.column_name,
        tc.constraint_type
    FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema = 'cobol_analysys' AND tc.table_name = 'programs';
  `);
  console.log("Constraints:", JSON.stringify(keys.rows, null, 2));

  await client.end();
}

run().catch(console.error);
