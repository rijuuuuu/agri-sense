import test from 'node:test';
import assert from 'node:assert/strict';

test('AgriSense API Gateway Health Endpoint Contract', async () => {
  const response = await fetch('http://localhost:3001/api/health');
  assert.equal(response.status, 200, 'Health endpoint should return HTTP 200');
  
  const body = await response.json();
  assert.equal(body.success, true, 'Response success should be true');
  assert.equal(body.data.status, 'healthy', 'Status should be healthy');
  assert.equal(body.data.service, 'AgriSense API Gateway', 'Service name should match');
  assert.ok(body.provenance, 'Response must include provenance metadata');
  assert.equal(body.provenance.mode, 'LIVE', 'Provenance mode should be LIVE');
  assert.ok(body.data.integrations.weather, 'Weather integration status must be reported');
});

test('AgriSense 404 Contract with Provenance', async () => {
  const response = await fetch('http://localhost:3001/api/non-existent-route');
  assert.equal(response.status, 404, 'Non-existent route should return HTTP 404');
  
  const body = await response.json();
  assert.equal(body.success, false, 'Response success should be false');
  assert.equal(body.error.code, 'ROUTE_NOT_FOUND', 'Error code should be ROUTE_NOT_FOUND');
  assert.ok(body.provenance, 'Error response must include provenance metadata');
});
