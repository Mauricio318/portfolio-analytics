import { createClient, Client } from '@libsql/client';

let tursoClient: Client | null = null;

export function getTursoClient(): Client | null {
  const url = process.env.TURSO_DATABASE_URL || process.env.NEXT_PUBLIC_TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN || process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    return null;
  }

  if (!tursoClient) {
    tursoClient = createClient({
      url: url.trim(),
      authToken: authToken.trim(),
    });
  }

  return tursoClient;
}

export function isTursoEnabled(): boolean {
  return !!getTursoClient();
}
