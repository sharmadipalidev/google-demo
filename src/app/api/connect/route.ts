import { generateOAuthUrl } from 'corsair/oauth';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { corsair } from '@/server/corsair';
import { auth } from "@/lib/auth";

const APP_URL = (process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const REDIRECT_URI = `${APP_URL}/api/corsair-callback`;

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        const userId = session?.user?.id || "test-user-id";
        const userEmail = session?.user?.email;
        // if (!userId) {
        //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        const plugin = new URL(request.url).searchParams.get('plugin');
        if (!plugin) {
            return NextResponse.json({ error: 'Missing plugin param' }, { status: 400 });
        }

        // Ensure the tenant is created so Corsair generates a DEK for them
        try {
            await corsair.manage.tenants.create({ id: userId });
        } catch (err) {
            // Ignore if tenant already exists
            console.error("Tenant creation error (might already exist):", err);
        }

        const { url, state } = await generateOAuthUrl(corsair, plugin, {
            tenantId: userId,
            redirectUri: REDIRECT_URI,
        });

        const oauthUrl = new URL(url);
        if (userEmail) {
            oauthUrl.searchParams.set('login_hint', userEmail);
        }

        const response = NextResponse.redirect(oauthUrl.toString());
        response.cookies.set('oauth_state', state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 10,
        });
        return response;
    } catch (e: any) {
        console.error("CONNECT ERROR:", e);
        return NextResponse.json({ error: 'Internal Server Error', message: e?.message, stack: e?.stack }, { status: 500 });
    }
}
