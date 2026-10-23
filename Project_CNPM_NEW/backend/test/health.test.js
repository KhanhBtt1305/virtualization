const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../server');

test('GET /health returns ok', async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'ok');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
