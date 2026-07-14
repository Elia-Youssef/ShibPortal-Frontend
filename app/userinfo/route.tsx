import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { GetUserInfo } from '@shibaone/shib-auth-sdk';

export async function GET(req: NextRequest) {
  const headers_instance = await headers();
  const access_token = headers_instance.get('Authorization');
  const cookies = req.headers.get('cookie');
  const auth0Url = process.env.NEXT_PUBLIC_AUTH0_BASE_PATH ?? cookies
    ?.split('; ')
    .find(cookie => cookie.startsWith('auth0Url='))
    ?.split('=')[1];
  
  try {
    if (!access_token) throw new Error('Access token not setted');
    if (!auth0Url) throw new Error('Auth0 Url cookie not setted');
    const response = await GetUserInfo(access_token, auth0Url);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(error, { status: 500 });
  }
}
