import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvFile(path) {
  try {
    const content = readFileSync(path, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const separator = trimmed.indexOf('=');
      if (separator === -1) continue;
      const name = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim();
      if (process.env[name] === undefined) process.env[name] = value;
    }
  } catch {
    // ignore missing env file
  }
}

loadEnvFile(resolve(process.cwd(), '.env.local'));
loadEnvFile(resolve(process.cwd(), '.env'));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

try {
  const authHeaders = { apikey: key, Authorization: `Bearer ${key}` };

  const health = await fetch(`${url}/auth/v1/health`, { headers: authHeaders });
  console.log(`Auth health status: ${health.status}`);

  const rest = await fetch(`${url}/rest/v1/`, { headers: authHeaders });
  console.log(`REST status: ${rest.status}`);

  if (!health.ok) {
    console.error('Auth health check did not return 2xx. Check the project URL and anon key.');
    process.exit(1);
  }

  if (rest.status === 401) {
    const body = await rest.json().catch(() => ({}));
    if (body.hint?.includes('service_role')) {
      console.log(
        'Auth is healthy. The REST schema root is restricted to service_role, which is expected before tables exist.',
      );
      process.exit(0);
    }
  }

  if (!rest.ok) {
    console.error(
      `REST API returned ${rest.status}. Check that the anon key is enabled for this project.`,
    );
    process.exit(1);
  }

  console.log('Supabase project is reachable and the anon key is accepted.');
} catch (error) {
  console.error(`Supabase connection failed: ${error.message}`);
  process.exit(1);
}
