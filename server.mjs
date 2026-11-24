// Railway-ready Node entrypoint for SvelteKit (@sveltejs/adapter-node)
// Configures proxy headers, 0.0.0.0 binding, and ORIGIN from RAILWAY_PUBLIC_DOMAIN automatically.

process.env.HOST ??= '0.0.0.0';
process.env.PORT ??= '3000';
process.env.PROTOCOL_HEADER ??= 'x-forwarded-proto';
process.env.HOST_HEADER ??= 'x-forwarded-host';
process.env.ADDRESS_HEADER ??= 'x-forwarded-for';

if (!process.env.ORIGIN && process.env.RAILWAY_PUBLIC_DOMAIN) {
  process.env.ORIGIN = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
}

await import('./build/index.js');
