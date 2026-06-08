import assert from 'node:assert/strict';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { describe, it } from 'node:test';

import { ServiceClient } from '../src/graphql/service-client.ts';

async function withServer(
  handler: (req: IncomingMessage, res: ServerResponse) => void,
  run: (baseUrl: string) => Promise<void>,
) {
  const server = createServer(handler);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const { port } = server.address() as AddressInfo;
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
  }
}

describe('ServiceClient', () => {
  it('unwraps success responses and propagates auth/correlation headers', async () => {
    await withServer(
      (req, res) => {
        assert.equal(req.headers.authorization, 'Bearer jwt-token');
        assert.equal(req.headers['x-correlation-id'], 'cid-123');
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, data: { ok: true } }));
      },
      async (baseUrl) => {
        const client = new ServiceClient(baseUrl, 'jwt-token', 'cid-123');
        const data = await client.get<{ ok: boolean }>('/health');
        assert.equal(data.ok, true);
      },
    );
  });

  it('serializes POST payloads', async () => {
    await withServer(
      (req, res) => {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', () => {
          assert.equal(req.method, 'POST');
          assert.deepEqual(JSON.parse(body), { reservationId: 'res-1' });
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, data: { id: 'pay-1' } }));
        });
      },
      async (baseUrl) => {
        const client = new ServiceClient(baseUrl);
        const data = await client.post<{ id: string }>('/payments', {
          reservationId: 'res-1',
        });
        assert.equal(data.id, 'pay-1');
      },
    );
  });

  it('throws service error messages', async () => {
    await withServer(
      (_req, res) => {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            success: false,
            error: { message: 'Sin permisos para esta reserva' },
          }),
        );
      },
      async (baseUrl) => {
        const client = new ServiceClient(baseUrl);
        await assert.rejects(
          () => client.get('/reservations/res-1'),
          /Sin permisos para esta reserva/,
        );
      },
    );
  });
});
