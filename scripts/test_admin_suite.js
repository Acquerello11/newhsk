// scripts/test_admin_suite.js
import { createClient } from '@libsql/client';
import fs from 'node:fs';
import crypto from 'node:crypto';

const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
for (const line of envContent.split(/\r?\n/)) {
	const trimmed = line.trim();
	if (trimmed && !trimmed.startsWith('#')) {
		const [k, ...v] = trimmed.split('=');
		if (k) env[k.trim()] = v.join('=').trim();
	}
}

const client = createClient({
	url: env.TURSO_DATABASE_URL,
	authToken: env.TURSO_AUTH_TOKEN
});

const BASE_URL = 'http://localhost:3000';

async function runTestSuite() {
	console.log('====================================================');
	console.log('🧪 RUNNING COMPREHENSIVE ADMIN SUITE TEST');
	console.log(`Target URL: ${BASE_URL}`);
	console.log('====================================================\n');

	let passed = 0;
	let failed = 0;

	function assert(condition, message) {
		if (condition) {
			console.log(`✅ [PASS] ${message}`);
			passed++;
		} else {
			console.error(`❌ [FAIL] ${message}`);
			failed++;
		}
	}

	// 1. Test Home page
	try {
		const homeRes = await fetch(BASE_URL);
		assert(homeRes.status === 200, `GET / returns 200 OK (Status: ${homeRes.status})`);
	} catch (e) {
		assert(false, `GET / failed: ${e.message}`);
	}

	// 2. Test Admin page when Anonymous
	try {
		const adminAnonRes = await fetch(`${BASE_URL}/admin`);
		const anonHtml = await adminAnonRes.text();
		assert(adminAnonRes.status === 200, `GET /admin (Anonymous) returns 200 OK`);
		assert(anonHtml.includes('เข้าสู่ระบบผู้ดูแล'), `Admin login form renders with Thai title`);
		assert(anonHtml.includes('name="username"') && anonHtml.includes('name="password"'), `Login form inputs present`);
	} catch (e) {
		assert(false, `GET /admin (Anonymous) failed: ${e.message}`);
	}

	// 3. Test Invalid password rate limit & warning
	try {
		const form = new URLSearchParams();
		form.append('username', 'admin');
		form.append('password', 'wrong_pass_123');
		const loginFailRes = await fetch(`${BASE_URL}/admin?/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: form.toString()
		});
		const failText = await loginFailRes.text();
		assert(loginFailRes.status === 400 || loginFailRes.status === 429, `Invalid password returns 400 or 429 (Status: ${loginFailRes.status})`);
		assert(failText.includes('ไม่ถูกต้อง') || failText.includes('ระงับ'), `Returns Thai failure message`);
	} catch (e) {
		assert(false, `Login failure test failed: ${e.message}`);
	}

	// 4. Create an Admin session and a Non-Admin session in Turso DB for testing
	const adminToken = 'test_admin_session_' + crypto.randomBytes(16).toString('hex');
	const learnerToken = 'test_learner_session_' + crypto.randomBytes(16).toString('hex');
	const expiresAt = Date.now() + 3600000; // 1 hour

	await client.execute({
		sql: 'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)',
		args: [adminToken, 9, expiresAt] // User 9 is 'admin'
	});

	await client.execute({
		sql: 'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)',
		args: [learnerToken, 2, expiresAt] // User 2 is 'ball' (learner)
	});

	// 5. Test Admin Dashboard with Admin Session
	try {
		const adminDashRes = await fetch(`${BASE_URL}/admin`, {
			headers: { 'Cookie': `session=${adminToken}` }
		});
		const dashHtml = await adminDashRes.text();
		assert(adminDashRes.status === 200, `GET /admin with Admin Session returns 200 OK`);
		assert(dashHtml.includes('@admin'), `Admin dashboard renders admin username @admin`);
		assert(dashHtml.includes('ผู้เรียน (Learners)'), `Dashboard displays Learner statistics card`);
		assert(dashHtml.includes('ค้นหาผู้เรียนตามชื่อ หรือรหัส ID...'), `Header search placeholder rendered correctly`);
		assert(dashHtml.includes('ความแม่นยำวรรณยุกต์ (Tone Accuracy)'), `Tone Accuracy section rendered`);
		assert(dashHtml.includes('Dual Cloud DB'), `Dual Cloud DB live status card rendered`);
	} catch (e) {
		assert(false, `Admin Dashboard test failed: ${e.message}`);
	}

	// 6. Test Export CSV endpoint with Admin Session
	try {
		const exportCsvRes = await fetch(`${BASE_URL}/api/admin/export?format=csv&limit=10`, {
			headers: { 'Cookie': `session=${adminToken}` }
		});
		assert(exportCsvRes.status === 200, `GET /api/admin/export?format=csv returns 200 OK`);
		const contentType = exportCsvRes.headers.get('content-type') || '';
		assert(contentType.includes('text/csv'), `Content-Type is text/csv (Got: ${contentType})`);
		const csvText = await exportCsvRes.text();
		assert(csvText.includes('evaluation_id,timestamp_iso,anonymized_user_id'), `CSV includes research dataset header`);
		assert(csvText.charCodeAt(0) === 0xFEFF, `CSV includes UTF-8 Byte Order Mark (BOM) for Excel display`);
	} catch (e) {
		assert(false, `CSV Export test failed: ${e.message}`);
	}

	// 7. Test Export xAPI JSON endpoint with Admin Session
	try {
		const exportJsonRes = await fetch(`${BASE_URL}/api/admin/export?format=xapi&limit=5`, {
			headers: { 'Cookie': `session=${adminToken}` }
		});
		assert(exportJsonRes.status === 200, `GET /api/admin/export?format=xapi returns 200 OK`);
		const jsonBody = await exportJsonRes.json();
		assert(Array.isArray(jsonBody), `xAPI export returns JSON Array of statements`);
	} catch (e) {
		assert(false, `xAPI JSON Export test failed: ${e.message}`);
	}

	// 8. Test User Detail API with Admin Session
	try {
		const userDetailRes = await fetch(`${BASE_URL}/api/admin/user-detail/2`, {
			headers: { 'Cookie': `session=${adminToken}` }
		});
		assert(userDetailRes.status === 200, `GET /api/admin/user-detail/2 returns 200 OK`);
		const userJson = await userDetailRes.json();
		assert(userJson.id === 2 && userJson.username === 'ball', `User detail returns correct learner record`);
	} catch (e) {
		assert(false, `User Detail API test failed: ${e.message}`);
	}

	// 9. Test Saving Listening Policy & Pitch Tuning (System Settings persistence)
	try {
		const policyForm = new URLSearchParams();
		policyForm.append('policy', 'strict');
		const policyRes = await fetch(`${BASE_URL}/admin?/saveListeningPolicy`, {
			method: 'POST',
			headers: {
				'Cookie': `session=${adminToken}`,
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: policyForm.toString()
		});
		assert(policyRes.status === 200, `POST /admin?/saveListeningPolicy returns 200 OK`);

		// Verify in Turso DB
		const settingCheck = await client.execute({
			sql: 'SELECT value FROM system_settings WHERE key = ?',
			args: ['listening_policy']
		});
		assert(settingCheck.rows[0]?.value === 'strict', `System setting listening_policy persisted to DB as 'strict'`);

		// Test pitch sensitivity
		const pitchForm = new URLSearchParams();
		pitchForm.append('sensitivity', 'strict');
		const pitchRes = await fetch(`${BASE_URL}/admin?/savePitchTuning`, {
			method: 'POST',
			headers: {
				'Cookie': `session=${adminToken}`,
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: pitchForm.toString()
		});
		assert(pitchRes.status === 200, `POST /admin?/savePitchTuning returns 200 OK`);

		const pitchCheck = await client.execute({
			sql: 'SELECT value FROM system_settings WHERE key = ?',
			args: ['pitch_sensitivity']
		});
		assert(pitchCheck.rows[0]?.value === 'strict', `System setting pitch_sensitivity persisted to DB as 'strict'`);
	} catch (e) {
		assert(false, `System policy persistence test failed: ${e.message}`);
	}

	// 10. Test Non-Admin Access Protection (Security gate)
	try {
		const learnerAdminRes = await fetch(`${BASE_URL}/admin`, {
			headers: { 'Cookie': `session=${learnerToken}` }
		});
		assert(learnerAdminRes.status === 403, `Non-admin user 'ball' blocked from /admin with 403 Forbidden`);

		const learnerExportRes = await fetch(`${BASE_URL}/api/admin/export`, {
			headers: { 'Cookie': `session=${learnerToken}` }
		});
		assert(learnerExportRes.status === 403, `Non-admin user 'ball' blocked from exporting data with 403 Forbidden`);

		const learnerUserDetailRes = await fetch(`${BASE_URL}/api/admin/user-detail/2`, {
			headers: { 'Cookie': `session=${learnerToken}` }
		});
		assert(learnerUserDetailRes.status === 403, `Non-admin user 'ball' blocked from user drilldown API with 403 Forbidden`);
	} catch (e) {
		assert(false, `Non-admin security test failed: ${e.message}`);
	}

	// Clean up temporary test sessions
	await client.execute({
		sql: 'DELETE FROM sessions WHERE token IN (?, ?)',
		args: [adminToken, learnerToken]
	});

	console.log('\n====================================================');
	console.log(`🏁 TEST RESULT: ${passed} PASSED, ${failed} FAILED`);
	console.log('====================================================');

	if (failed === 0) {
		console.log('🎉 ALL ADMIN SUITE TESTS PASSED PERFECTLY!');
	}
}

runTestSuite();
