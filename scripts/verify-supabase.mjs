const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

try {
  const health = await fetch(`${url}/auth/v1/health`);
  console.log(`Auth health status: ${health.status}`);

  const rest = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  console.log(`REST status: ${rest.status}`);

  if (!health.ok) {
    console.error('Auth health check did not return 2xx. Check the project URL.');
    process.exit(1);
  }

  console.log('Supabase project is reachable and the publishable key is accepted.');
} catch (error) {
  console.error(`Supabase connection failed: ${error.message}`);
  process.exit(1);
}
