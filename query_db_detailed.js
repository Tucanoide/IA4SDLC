const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://checknewsai_user:whoknowswhatthefuck212!!@72.60.50.6:5434/ia4sdlc_cobolpoc'
});

async function run() {
  await client.connect();

  console.log("=== COLUMNS ===");
  const colRes = await client.query(`
    SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'cobol_analysis' AND table_name = 'programs'
    ORDER BY ordinal_position;
  `);
  console.table(colRes.rows);

  console.log("\n=== CONSTRAINTS ===");
  const consRes = await client.query(`
    SELECT
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
    FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        LEFT JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
    WHERE tc.table_schema = 'cobol_analysis' AND tc.table_name = 'programs';
  `);
  console.table(consRes.rows);

  console.log("\n=== INDEXES ===");
  const indRes = await client.query(`
    SELECT
        ix.relname AS index_name,
        a.attname AS column_name
    FROM
        pg_class t,
        pg_class ix,
        pg_index i,
        pg_attribute a,
        pg_namespace n
    WHERE
        t.oid = i.indrelid
        AND ix.oid = i.indexrelid
        AND a.attrelid = t.oid
        AND a.attnum = ANY(i.indkey)
        AND t.relkind = 'r'
        AND t.relname = 'programs'
        AND n.oid = t.relnamespace
        AND n.nspname = 'cobol_analysis';
  `);
  console.table(indRes.rows);

  console.log("\n=== ROW COUNT ===");
  const cntRes = await client.query(`SELECT count(*) FROM cobol_analysis.programs`);
  console.log(cntRes.rows[0].count);

  console.log("\n=== SAMPLE DATA (3 rows) ===");
  const sampleRes = await client.query(`SELECT * FROM cobol_analysis.programs LIMIT 3`);
  console.log(JSON.stringify(sampleRes.rows, null, 2));

  await client.end();
}

run().catch(console.error);
