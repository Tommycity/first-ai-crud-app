const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');

const { app } = require('../index.js');

async function startServer() {
  const server = app.listen(0);
  await once(server, 'listening');
  const { port } = server.address();
  return { server, port };
}

async function stopServer(server) {
  server.close();
  await once(server, 'close');
}

async function request(path, options = {}) {
  const { server, port } = await startServer();
  try {
    const response = await fetch(`http://127.0.0.1:${port}${path}`, options);
    const body = await response.text();
    return { response, body };
  } finally {
    await stopServer(server);
  }
}

test('GET / returns API metadata', async () => {
  const { response, body } = await request('/');

  assert.equal(response.status, 200);
  assert.match(body, /"name":"Task API"/);
  assert.match(body, /"version":"1.0"/);
});

test('GET /tasks supports filtering and reset', async () => {
  const { response, body } = await request('/tasks?done=true');

  assert.equal(response.status, 200);
  const data = JSON.parse(body);
  assert.ok(Array.isArray(data));
  assert.ok(data.every((task) => task.done === true));

  const resetResponse = await request('/reset', { method: 'POST' });
  assert.equal(resetResponse.response.status, 200);
});
