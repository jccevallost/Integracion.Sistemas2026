import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { registry } from '../src/config/registry.ts';
import { rewritePublicApiPath } from '../src/proxy/router.ts';

describe('public API versioning', () => {
  it('registers v2 public prefixes alongside v1 compatibility routes', () => {
    const prefixes = registry.flatMap((service) => service.pathPrefixes);

    assert.ok(prefixes.includes('/api/v2/auth'));
    assert.ok(prefixes.includes('/api/v2/flights'));
    assert.ok(prefixes.includes('/api/v2/reservations'));
    assert.ok(prefixes.includes('/api/v1/reservations'));
  });

  it('rewrites v2 gateway paths to v1 upstream paths', () => {
    assert.equal(
      rewritePublicApiPath('/search?origin=UIO', '/api/v2/flights'),
      '/api/v1/flights/search?origin=UIO',
    );

    assert.equal(
      rewritePublicApiPath('/', '/api/v2/reservations'),
      '/api/v1/reservations',
    );
  });
});
