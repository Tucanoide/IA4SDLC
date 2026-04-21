const { Pool } = require('pg');
const pool = new Pool({
  connectionString: "postgres://checknewsai_user:whoknowswhatthefuck212!!@72.60.50.6:5434/ia4sdlc_cobolpoc"
});

async function main() {
  const client = await pool.connect();
  try {
    const techCols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema = 'cobol_analysis' AND table_name = 'technical_docs'");
    console.log('Tech Cols:', techCols.rows.map(r => r.column_name));

    const funcCols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema = 'cobol_analysis' AND table_name = 'functional_docs'");
    console.log('Func Cols:', funcCols.rows.map(r => r.column_name));

    const techData = await client.query("SELECT * FROM cobol_analysis.technical_docs WHERE program_name = 'CBACT04C'");
    console.log('Tech Data keys:', techData.rows[0] ? Object.keys(techData.rows[0]) : 'NONE');

  } finally {
    client.release();
  }
}

main().catch(console.error).finally(() => pool.end());
