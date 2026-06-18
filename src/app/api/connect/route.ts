import { generateOAuthUrl } from 'corsair/oauth';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { corsair } from '@/server/corsair';
import { auth } from '@clerk/nextjs/server';

const REDIRECT_URI = `${process.env.APP_URL ?? 'http://localhost:3000'}/api/corsair-callback`;

export async function GET(request: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const plugin = new URL(request.url).searchParams.get('plugin');
    if (!plugin) {
        return NextResponse.json({ error: 'Missing plugin param' }, { status: 400 });
    }

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
