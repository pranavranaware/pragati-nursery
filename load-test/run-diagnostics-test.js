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
  const activeConn = await getMetric(token, 'hikaricp.connections.active');
  const pendingConn = await getMetric(token, 'hikaricp.connections.pending');
  const sysCpu = await getMetric(token, 'system.cpu.usage');
  const jvmCpu = await getMetric(token, 'process.cpu.usage');
  const heap = await getMetric(token, 'jvm.memory.used');
  const heapMax = await getMetric(token, 'jvm.memory.max');
  
  const tomcatBusy = await getMetric(token, 'tomcat.threads.busy');
  const tomcatActive = await getMetric(token, 'tomcat.threads.active');
  const tomcatMax = await getMetric(token, 'tomcat.threads.config.max');

  return { activeConn, pendingConn, sysCpu, jvmCpu, heap, heapMax, tomcatBusy, tomcatActive, tomcatMax };
}

function runAutocannon(connections, path) {
  return new Promise((resolve, reject) => {
    const instance = autocannon({
      url: `${BASE_URL}${path}`,
      connections: connections,
      duration: 10,
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

    console.log('\nStarting 1000 concurrency diagnostic benchmark...');

    let statsPromise = new Promise((resolve) => {
      setTimeout(async () => {
        console.log('\n--- Capturing mid-run diagnostics ---');
        const stats = await collectObservability(token);
        resolve(stats);
      }, 5000);
    });

    const resultPromise = runAutocannon(1000, '/api/v1/products');
    
    const [result, diagnosticsCaptured] = await Promise.all([resultPromise, statsPromise]);
    
    console.log('\n=== DIAGNOSTIC BENCHMARK RESULTS ===');
    console.log('RPS:', Math.round(result.requests.average));
    console.log('Avg Latency:', result.latency.average, 'ms');
    console.log('P95 Latency:', result.latency.p95, 'ms');
    console.log('P99 Latency:', result.latency.p99, 'ms');
    console.log('Total Errors:', result.errors + (result.non2xx || 0));
    console.log('Autocannon Timeout Errors:', result.errors);
    
    if (diagnosticsCaptured) {
      console.log('\n=== MID-RUN OBSERVABILITY STATS ===');
      console.log('Hikari Active Connections:', diagnosticsCaptured.activeConn);
      console.log('Hikari Pending Connections:', diagnosticsCaptured.pendingConn);
      console.log('Tomcat Busy Threads:', diagnosticsCaptured.tomcatBusy);
      console.log('Tomcat Active Threads:', diagnosticsCaptured.tomcatActive);
      console.log('Tomcat Max Threads (Config):', diagnosticsCaptured.tomcatMax);
      console.log('JVM CPU (process.cpu.usage):', Math.round((diagnosticsCaptured.jvmCpu || 0) * 100) + '%');
      console.log('System CPU (system.cpu.usage):', Math.round((diagnosticsCaptured.sysCpu || 0) * 100) + '%');
      console.log('JVM Heap Used:', Math.round((diagnosticsCaptured.heap || 0) / (1024 * 1024)), 'MB');
      console.log('JVM Heap Max:', Math.round((diagnosticsCaptured.heapMax || 0) / (1024 * 1024)), 'MB');
    }

  } catch (err) {
    console.error('Error running diagnostics load test:', err);
  }
}

start();
