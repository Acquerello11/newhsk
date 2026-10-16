// scripts/test_connections.js
import fs from 'node:fs';

// Read .env file
const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
for (const line of envContent.split(/\r?\n/)) {
	const trimmed = line.trim();
	if (trimmed && !trimmed.startsWith('#')) {
		const [k, ...v] = trimmed.split('=');
		if (k) env[k.trim()] = v.join('=').trim();
	}
}

console.log('====================================================');
console.log('🚀 TESTING CLOUD DATABASE CONNECTIONS');
console.log('====================================================\n');

async function testTurso() {
	console.log('--- 1. Testing Turso Cloud (libSQL) ---');
	const rawUrl = env.TURSO_DATABASE_URL;
	const token = env.TURSO_AUTH_TOKEN;

	if (!rawUrl || !token) {
		console.error('❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env');
		return false;
	}

	const httpUrl = rawUrl.replace(/^libsql:\/\//, 'https://').replace(/\/$/, '') + '/v2/pipeline';
	console.log(`Connecting to: ${httpUrl}`);

	try {
		const res = await fetch(httpUrl, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				requests: [
					{ type: 'execute', stmt: { sql: 'SELECT 1 as test_val, datetime("now") as server_time' } },
					{ type: 'execute', stmt: { sql: "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name" } }
				]
			})
		});

		if (!res.ok) {
			const errText = await res.text();
			console.error(`❌ Turso HTTP request failed [${res.status}]:`, errText);
			return false;
		}

		const data = await res.json();
		const results = data.results || [];
		
		console.log('✅ [Turso] Successfully connected!');
		const pingResult = results[0]?.response?.result;
		if (pingResult) {
			console.log('   Ping result:', pingResult.rows);
		}

		const tablesResult = results[1]?.response?.result;
		const tableRows = tablesResult?.rows || [];
		console.log(`\n📊 Existing tables in Turso (${tableRows.length} tables):`);
		
		// Query count for each table
		if (tableRows.length > 0) {
			const countRequests = tableRows.map((r) => {
				const tableName = r[0]?.value ?? r[0];
				return { type: 'execute', stmt: { sql: `SELECT COUNT(*) as count FROM "${tableName}"` } };
			});

			const countRes = await fetch(httpUrl, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ requests: countRequests })
			});

			if (countRes.ok) {
				const countData = await countRes.json();
				tableRows.forEach((r, idx) => {
					const tableName = r[0]?.value ?? r[0];
					const cnt = countData.results?.[idx]?.response?.result?.rows?.[0]?.[0]?.value ?? '?';
					console.log(`   - ${tableName}: ${cnt} rows`);
				});
			}
		} else {
			console.log('   (No tables created yet - SCHEMA will auto-migrate on first app load)');
		}

		return true;
	} catch (e) {
		console.error('❌ Turso connection exception:', e.message);
		return false;
	}
}

async function testNeon() {
	console.log('\n--- 2. Testing Neon Serverless PostgreSQL ---');
	const dbUrl = env.DATABASE_URL;

	if (!dbUrl) {
		console.error('❌ Missing DATABASE_URL in .env');
		return false;
	}

	try {
		const parsed = new URL(dbUrl);
		const host = parsed.hostname;
		const endpoint = `https://${host}/sql`;
		console.log(`Connecting to endpoint: ${endpoint}`);

		const pingQuery = 'SELECT 1 as test, current_database() as db_name, version() as pg_version, CURRENT_TIMESTAMP as server_time;';
		const res = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Neon-Connection-String': dbUrl
			},
			body: JSON.stringify({ query: pingQuery })
		});

		if (!res.ok) {
			const errText = await res.text();
			console.error(`❌ Neon HTTP request failed [${res.status}]:`, errText);
			return false;
		}

		const data = await res.json();
		console.log('✅ [Neon PostgreSQL] Successfully connected!');
		if (data.rows && data.rows.length > 0) {
			const row = data.rows[0];
			console.log(`   Database: ${row.db_name}`);
			console.log(`   Server time: ${row.server_time}`);
			console.log(`   Version: ${row.pg_version?.slice(0, 40)}...`);
		}

		// Inspect tables
		const tablesQuery = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;";
		const tablesRes = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Neon-Connection-String': dbUrl
			},
			body: JSON.stringify({ query: tablesQuery })
		});

		if (tablesRes.ok) {
			const tablesData = await tablesRes.json();
			const tables = tablesData.rows || [];
			console.log(`\n📊 Existing public tables in Neon (${tables.length} tables):`);
			for (const t of tables) {
				const countRes = await fetch(endpoint, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Neon-Connection-String': dbUrl
					},
					body: JSON.stringify({ query: `SELECT COUNT(*) as count FROM "${t.table_name}";` })
				});
				let cnt = '?';
				if (countRes.ok) {
					const cData = await countRes.json();
					cnt = cData.rows?.[0]?.count ?? '?';
				}
				console.log(`   - ${t.table_name}: ${cnt} rows`);
			}
		}

		return true;
	} catch (e) {
		console.error('❌ Neon connection exception:', e.message);
		return false;
	}
}

async function run() {
	const tursoOk = await testTurso();
	const neonOk = await testNeon();

	console.log('\n====================================================');
	console.log('📋 SUMMARY:');
	console.log(`Turso Cloud libSQL:      ${tursoOk ? '✅ PASSED' : '❌ FAILED'}`);
	console.log(`Neon Serverless Postgres: ${neonOk ? '✅ PASSED' : '❌ FAILED'}`);
	console.log('====================================================');
}

run();
