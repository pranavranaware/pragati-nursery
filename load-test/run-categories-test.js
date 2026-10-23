const autocannon = require('autocannon');

const BASE_URL = 'http://localhost:8080';
const ADMIN_EMAIL = 'admin@pragatinursery.in';
const ADMIN_PASSWORD = 'admin123';

async function login() {
  const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  if (!res.ok) throw new Error(`Login failed`);
  const data = await res.json();
  return data.data.accessToken || data.accessToken;
}

async function getMetric(token, name) {
  try {
    const res = await fetch(`${BASE_URL}/actuator/metrics/${name}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.measurements[0].value;
  } catch (err) {
    return null;
  }
}

async function collectObservability(token) {
  const active = await getMetric(token, 'hikaricp.connections.active');
  const idle = await getMetric(token, 'hikaricp.connections.idle');
  const pending = await getMetric(token, 'hikaricp.connections.pending');
  const cpu = await getMetric(token, 'system.cpu.usage');
  const processCpu = await getMetric(token, 'process.cpu.usage');
  return { active, idle, pending, cpu, processCpu };
}

function runAutocannon(connections, path) {
  return new Promise((resolve, reject) => {
    autocannon({
      url: `${BASE_URL}${path}`,
      connections: connections,
      duration: 5, // 5 seconds is enough to compare
      pipelining: 1
    }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

async function start() {
  try {
    const token = await login();
    const concurrencies = [50, 100, 250];
    console.log('\n--- TESTING /api/v1/categories ---');
    for (const c of concurrencies) {
      const statsBefore = await collectObservability(token);
      const result = await runAutocannon(c, '/api/v1/categories');
      const statsAfter = await collectObservability(token);
      console.log(`C: ${c} | RPS: ${Math.round(result.requests.average)} | Latency: ${result.latency.average}ms | Errors: ${result.errors + (result.non2xx || 0)} | Active: ${statsAfter.active} | Pending: ${statsAfter.pending} | Sys CPU: ${Math.round((statsAfter.cpu || 0)*100)}% | JVM CPU: ${Math.round((statsAfter.processCpu || 0)*100)}%`);
    }

    console.log('\n--- TESTING /api/v1/products ---');
    for (const c of concurrencies) {
      const statsBefore = await collectObservability(token);
      const result = await runAutocannon(c, '/api/v1/products');
      const statsAfter = await collectObservability(token);
      console.log(`C: ${c} | RPS: ${Math.round(result.requests.average)} | Latency: ${result.latency.average}ms | Errors: ${result.errors + (result.non2xx || 0)} | Active: ${statsAfter.active} | Pending: ${statsAfter.pending} | Sys CPU: ${Math.round((statsAfter.cpu || 0)*100)}% | JVM CPU: ${Math.round((statsAfter.processCpu || 0)*100)}%`);
    }
  } catch (err) {
    console.error(err);
  }
}

start();
