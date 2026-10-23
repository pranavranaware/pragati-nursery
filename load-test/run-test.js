const autocannon = require('autocannon');

const BASE_URL = 'http://localhost:8080';
const ADMIN_EMAIL = 'admin@pragatinursery.in';
const ADMIN_PASSWORD = 'admin123';

async function login() {
  console.log('Logging in as admin...');
  const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  if (!res.ok) {
    throw new Error(`Login failed with status ${res.status}`);
  }
  const data = await res.json();
  const token = data.data.accessToken || data.accessToken;
  console.log('Login successful! Admin JWT Token acquired.');
  return token;
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
  const max = await getMetric(token, 'hikaricp.connections.max');
  const cpu = await getMetric(token, 'system.cpu.usage');
  const processCpu = await getMetric(token, 'process.cpu.usage');
  const threads = await getMetric(token, 'jvm.threads.live');

  return { active, idle, pending, max, cpu, processCpu, threads };
}

function runAutocannon(connections, path) {
  return new Promise((resolve, reject) => {
    console.log(`Running autocannon load test with ${connections} concurrent connections on ${path}...`);
    const instance = autocannon({
      url: `${BASE_URL}${path}`,
      connections: connections,
      duration: 10, // 10 seconds per test
      pipelining: 1
    }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });

    autocannon.track(instance, { renderProgressBar: true });
  });
}

async function start() {
  try {
    const token = await login();
    const concurrencies = [50, 100, 250, 500, 1000];
    const testEndpoints = [
      '/api/v1/products',
      '/api/v1/categories',
      '/api/v1/products/mango-plant'
    ];

    const resultsTable = [];

    for (const c of concurrencies) {
      console.log('\n=======================================');
      console.log(`STARTING LOAD TEST FOR CONCURRENCY: ${c}`);
      console.log('=======================================');

      // Test all endpoints in a round-robin or test sequentially
      const path = testEndpoints[0]; // test public products listing
      
      const statsBefore = await collectObservability(token);
      console.log(`Before Run - Hikari Active: ${statsBefore.active}, Idle: ${statsBefore.idle}, Pending: ${statsBefore.pending}`);

      const result = await runAutocannon(c, path);
      
      const statsAfter = await collectObservability(token);
      console.log(`After Run - Hikari Active: ${statsAfter.active}, Idle: ${statsAfter.idle}, Pending: ${statsAfter.pending}`);

      const totalRequests = result.requests.sent;
      const rps = result.requests.average;
      const avgLatency = result.latency.average;
      const p50 = result.latency.p50;
      const p95 = result.latency.p95;
      const p99 = result.latency.p99;
      const errors = result.errors + (result.non2xx || 0);

      resultsTable.push({
        concurrency: c,
        rps: Math.round(rps),
        avg: avgLatency,
        p95: p95,
        p99: p99,
        errors: errors,
        active: statsAfter.active,
        pending: statsAfter.pending,
        sysCpu: Math.round((statsAfter.cpu || 0) * 100) + '%',
        jvmCpu: Math.round((statsAfter.processCpu || 0) * 100) + '%',
        threads: statsAfter.threads
      });

      console.log(`Concurrency ${c} Done. Avg Latency: ${avgLatency}ms, RPS: ${Math.round(rps)}, Errors: ${errors}`);

      if (errors > (totalRequests * 0.1)) {
        console.warn('WARNING: Error rate is over 10%! Stopping progressive load test to protect local system stability.');
        break;
      }
    }

    console.log('\n\n========================================================================================');
    console.log('FINAL LOAD TEST RESULT TABLE');
    console.log('========================================================================================');
    console.table(resultsTable);

  } catch (err) {
    console.error('Error running load test:', err);
  }
}

start();
