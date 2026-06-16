const baseUrl = (process.env.GATEWAY_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      'x-correlation-id': 'smoke-v2-local',
      ...(options.headers ?? {}),
    },
  });

  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  return { response, body };
}

function expectStatus(label, response, allowed) {
  if (!allowed.includes(response.status)) {
    throw new Error(`${label}: HTTP ${response.status}, esperado ${allowed.join('/')}`);
  }
  console.log(`OK ${label}: HTTP ${response.status}`);
}

async function main() {
  console.log(`Smoke API v2: ${baseUrl}`);

  const health = await request('/api/v2');
  expectStatus('gateway health v2', health.response, [200, 207]);

  const contractIndex = await request('/api/v2/contracts');
  expectStatus('contracts index', contractIndex.response, [200]);

  for (const [label, path] of Object.entries(contractIndex.body.data ?? {})) {
    const contract = await request(path, { headers: { accept: '*/*' } });
    expectStatus(`contract ${label}`, contract.response, [200]);
  }

  const graphql = await request('/graphql', {
    method: 'POST',
    body: JSON.stringify({ query: '{ __typename }' }),
  });
  expectStatus('graphql schema smoke', graphql.response, [200]);

  if (process.env.SMOKE_DEEP === '1') {
    const flights = await request('/api/v2/flights/search?origin=UIO&destination=GYE&date=2026-06-15');
    expectStatus('flight search v2', flights.response, [200]);
  }
}

main().catch((error) => {
  console.error(`FAIL smoke API v2: ${error.message}`);
  process.exit(1);
});
