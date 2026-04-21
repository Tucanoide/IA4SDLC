const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgres://checknewsai_user:whoknowswhatthefuck212!!@72.60.50.6:5434/ia4sdlc_cobolpoc'
});

async function run() {
  await client.connect();
  
  console.log('--- Searching for CBACT01C ---');
  
  // 1. Program details
  const progRes = await client.query('SELECT id, program_name, program_type, is_current FROM cobol_analysis.programs WHERE program_name = $1', ['CBACT01C']);
  console.log('Programs found:', progRes.rows.length);
  console.log(progRes.rows);

  // 2. Metrics
  const metricsRes = await client.query('SELECT program_name, generated_at FROM cobol_analysis.metrics WHERE program_name = $1', ['CBACT01C']);
  console.log('Metrics records:', metricsRes.rows.length);
  console.log(metricsRes.rows);

  // 3. Audit Runs (for Debt Analyzer)
  const runsRes = await client.query(`
    SELECT id, status, triggered_by, notes, started_at, completed_at
    FROM cobol_analysis.audit_runs
    WHERE triggered_by = 'ia4sdlc-code-audit'
      AND notes LIKE 'Auditoría de CBACT01C%'
    ORDER BY started_at DESC
  `);
  console.log('Audit Runs found:', runsRes.rows.length);
  runsRes.rows.forEach(r => {
    console.log(`- ID: ${r.id}, Status: ${r.status}, Notes: ${r.notes}`);
  });

  // 4. Check if finding types and findings exist for any run
  if (runsRes.rows.length > 0) {
    const runId = runsRes.rows[0].id;
    const findingsRes = await client.query('SELECT count(*) FROM cobol_analysis.audit_findings WHERE audit_run_id = $1', [runId]);
    console.log(`Findings count for run ${runId}:`, findingsRes.rows[0].count);
  }

  await client.end();
}

run().catch(console.error);
