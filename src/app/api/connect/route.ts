import { generateOAuthUrl } from 'corsair/oauth';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { corsair } from '@/server/corsair';
import { auth } from "@/lib/auth";

const APP_URL = (process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const REDIRECT_URI = `${APP_URL}/api/corsair-callback`;

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const plugin = new URL(request.url).searchParams.get('plugin');
    if (!plugin) {
        return NextResponse.json({ error: 'Missing plugin param' }, { status: 400 });
    }

    // Ensure the tenant is created so Corsair generates a DEK for them
    await corsair.manage.tenants.create({ id: userId });

    const { url, state } = await generateOAuthUrl(corsair, plugin, {
        tenantId: userId,
        redirectUri: REDIRECT_URI,
    });

    // Debug: log the generated OAuth URL to check redirect_uri
    const parsedUrl = new URL(url);
    console.log('[Corsair OAuth] redirect_uri in URL:', parsedUrl.searchParams.get('redirect_uri'));
    console.log('[Corsair OAuth] REDIRECT_URI we sent:', REDIRECT_URI);

    const response = NextResponse.redirect(url);
    response.cookies.set('oauth_state', state, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 10,
    });
    return response;
}
