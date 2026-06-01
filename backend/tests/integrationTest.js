const http = require('http');

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 4000;
const BASE = `http://${HOST}:${PORT}`;

function request(method, path, body = null, headers = {}){
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      method,
      hostname: HOST,
      port: PORT,
      path,
      headers: Object.assign({ 'Content-Type': 'application/json' }, headers)
    };

    const req = http.request(opts, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        const ct = res.headers['content-type'] || '';
        let parsed = raw;
        if (ct.includes('application/json') && raw) {
          try { parsed = JSON.parse(raw); } catch(e){}
        }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function run(){
  console.log('Integration test starting against', BASE);

  // 1. health
  const health = await request('GET','/api/health');
  console.log('/api/health', health.status, health.body);
  if (health.status !== 200) throw new Error('Health check failed');

  // 2. register a fresh student
  const suffix = Date.now();
  const regPayload = {
    username: `itest_user_${suffix}`,
    email: `itest_${suffix}@example.com`,
    password: 'Student123!',
    fullName: 'Integration Tester',
    phone: '0900000000'
  };

  const reg = await request('POST','/api/auth/register', regPayload);
  console.log('/api/auth/register', reg.status);
  if (!(reg.status === 200 || reg.status === 201)) throw new Error('Register failed: ' + JSON.stringify(reg.body));

  // 3. login
  const login = await request('POST','/api/auth/login',{ identifier: regPayload.email, password: regPayload.password });
  console.log('/api/auth/login', login.status);
  if (login.status !== 200) throw new Error('Login failed');
  const token = login.body.token;
  if (!token) throw new Error('No token returned on login');

// 4. list universities (student-auth required)
  const unis = await request('GET','/api/universities', null, { Authorization: `Bearer ${token}` });
  console.log('/api/universities', unis.status, Array.isArray(unis.body) ? `${unis.body.length} items` : typeof unis.body);
  
// 5. get majors for the first university (student-auth required)
  const firstUniv = Array.isArray(unis.body) && unis.body[0];
  if (!firstUniv) throw new Error('No university available for further tests');
  const majors = await request('GET',`/api/universities/${firstUniv.id}/majors`, null, { Authorization: `Bearer ${token}` });
  console.log(`/api/universities/${firstUniv.id}/majors`, majors.status, Array.isArray(majors.body?.majors) ? `${majors.body.majors.length} items` : typeof majors.body);
  
  const firstMajor = Array.isArray(majors.body?.majors) && majors.body.majors[0];
  if (!firstMajor) throw new Error('No major available for further tests');

  // 6. get subject groups for major
  const sgroups = await request('GET',`/api/majors/${firstMajor.id}/subject-groups`, null, { Authorization: `Bearer ${token}` });
console.log(`/api/majors/${firstMajor.id}/subject-groups`, sgroups.status, Array.isArray(sgroups.body?.subjectGroups) ? `${sgroups.body.subjectGroups.length} items` : typeof sgroups.body);
  
  const firstGroup = Array.isArray(sgroups.body?.subjectGroups) && sgroups.body.subjectGroups[0];
  if (!firstGroup) throw new Error('No subject group for major');

  // 7. submit application
  const appPayload = { major_id: firstMajor.id, subject_group_id: firstGroup.id, scores: { math: 8.0, literature: 7.0, english: 7.5 }, document_url: '' };
  const appResp = await request('POST','/api/applications', appPayload, { Authorization: `Bearer ${token}` });
  console.log('/api/applications', appResp.status, appResp.body && appResp.body.id ? `id=${appResp.body.id}` : 'no id');

  // 8. list my apps
  const myApps = await request('GET','/api/applications/my', null, { Authorization: `Bearer ${token}` });
  console.log('/api/applications/my', myApps.status, Array.isArray(myApps.body) ? `${myApps.body.length} items` : typeof myApps.body);

  // 9. admin login and admin endpoints
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@university.vn';
  const adminPass = process.env.ADMIN_PASSWORD || 'Admin123!';
  const adminLogin = await request('POST','/api/auth/login',{ identifier: adminEmail, password: adminPass });
  console.log('admin /api/auth/login', adminLogin.status);
  if (adminLogin.status !== 200) throw new Error('Admin login failed');
  const adminToken = adminLogin.body.token;

  const stats = await request('GET','/api/admin/stats', null, { Authorization: `Bearer ${adminToken}` });
  console.log('/api/admin/stats', stats.status, stats.body);

  const adminApps = await request('GET','/api/admin/applications', null, { Authorization: `Bearer ${adminToken}` });
  console.log('/api/admin/applications', adminApps.status, Array.isArray(adminApps.body) ? `${adminApps.body.length} items` : typeof adminApps.body);

  // If we have at least one application, try updating its status
  const someAppId = Array.isArray(adminApps.body) && adminApps.body[0] && adminApps.body[0].id;
  if (someAppId) {
    const upd = await request('PATCH', `/api/admin/applications/${someAppId}/status`, { status: 'approved' }, { Authorization: `Bearer ${adminToken}` });
    console.log(`/api/admin/applications/${someAppId}/status`, upd.status, upd.body);
  }

  console.log('Integration tests completed successfully');
}

run().catch(err => {
  console.error('Integration tests failed:', err && err.message ? err.message : err);
  process.exit(2);
});
