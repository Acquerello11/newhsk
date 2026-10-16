import { createClient } from '@libsql/client';

// ใช้ Turso remote DB
const db = createClient({
  url: 'libsql://hsk-db-lookmaizaza.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODc2MzQ4OTksImlkIjoiMDFhMDM3MjgtYjIwMS03ZDU0LWExNTMtYzgxMGM0MmU2NDQ3Iiwia2lkIjoiaVEwMzZtMVFlcW9DU29CMTdXN05DZVNJNlFnYW5ESVplMURZS2VhcFBlcyIsInJpZCI6IjhjYThmMGJlLTM1ZDUtNDFkYS05M2M4LTU4ZWYxZTAyMTJjMCJ9.38i8-nuOFeizEGRXDxpKiWxkj0VC8SnNNz-3IYXBNH-dFSqcbAX42dLa6CEJJlDDRpNxJhWl_DoebUx6kwoECQ'
});

async function main() {
  const r = await db.execute("SELECT id, username, created_at FROM users ORDER BY id LIMIT 20");
  if (r.rows.length === 0) {
    console.log('ไม่มี user ใน Turso DB เลย');
  } else {
    console.log('Users ใน Turso:');
    for (const row of r.rows) {
      console.log(`  id=${row.id}  username=${row.username}`);
    }
  }
}

main().catch(e => console.error('Error:', e.message)).finally(() => process.exit(0));
