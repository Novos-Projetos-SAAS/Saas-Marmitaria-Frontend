import { handleCheckout } from '@/server/checkoutBff.mjs';

export const runtime = 'nodejs';
async function handle(request, context) {
    const { action } = await context.params;
    return handleCheckout(request, action, {
        backendUrl: process.env.CHECKOUT_BACKEND_URL,
        siteOrigin: process.env.CHECKOUT_SITE_ORIGIN,
        allowLoopback: process.env.NODE_ENV === 'development'
    });
}
export const GET = handle;
export const POST = handle;
