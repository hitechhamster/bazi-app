export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
  if (!proxyUrl) return

  const { setGlobalDispatcher, ProxyAgent } = await import('undici')
  setGlobalDispatcher(new ProxyAgent(proxyUrl))
  // eslint-disable-next-line no-console
  console.log('[instrumentation] Global fetch dispatcher routed through proxy:', proxyUrl)
}
