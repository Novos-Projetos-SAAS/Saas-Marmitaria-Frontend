/** @type {import('next').NextConfig} */
const demo = process.env.NEXT_PUBLIC_INFINITEPAY_DEMO === 'local-only';
if (demo && process.env.NODE_ENV !== 'development') throw new Error('Demonstração recusada fora de development.');
const nextConfig = {
    ...(demo ? { agentRules:false, distDir:'.next-demo', async headers() { return [{source:'/:path*',headers:[
        {key:'Content-Security-Policy',value:"connect-src 'self' https://localhost:55446 wss://localhost:55446; form-action 'self' https://localhost:55446; frame-src 'none'; object-src 'none'; sandbox allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation allow-downloads"},
        {key:'Referrer-Policy',value:'no-referrer'}
    ]}];} } : {})
};

export default nextConfig;
