import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { describe, it } from 'node:test';

const contractsDir = path.resolve(process.cwd(), 'contracts');

describe('deployable contracts', () => {
  it('ships the public v2 REST, GraphQL and event contracts with the gateway', async () => {
    await Promise.all([
      access(path.join(contractsDir, 'rest', 'booking-api-v2.openapi.yaml')),
      access(path.join(contractsDir, 'graphql', 'schema-v2.graphql')),
      access(path.join(contractsDir, 'events', 'domain-events-v2.schema.json')),
    ]);
  });
});
