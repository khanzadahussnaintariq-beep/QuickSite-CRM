import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
type AccessRole = 'Admin' | 'Manager' | 'Developer';


const ROLE_ALLOWED_PATHS: Record<AccessRole, string[]> = {
    Admin: ['/dashboard'],

    Developer: [
        '/dashboard',
        '/dashboard/settings',
        '/dashboard/tickets',
        '/dashboard/projects',
    ],

    Manager: [
        '/dashboard',
        '/dashboard/settings',
        '/dashboard/tickets',
        '/dashboard/projects',
        '/dashboard/clients',
    ],
};

const ROLE_FALLBACK: Record<AccessRole, string> = {
    Admin: '/dashboard',
    Developer: '/dashboard',
    Manager: '/dashboard',
};


function isAllowed(role: AccessRole, pathname: string): boolean {
    if (role === 'Admin') return true;

    const allowedRoutes = ROLE_ALLOWED_PATHS[role];

    if (!allowedRoutes) return false;

    return allowedRoutes.some(
        (route) =>
            pathname === route ||
            pathname.startsWith(route + '/')
    );
}


const INTERNAL_PATTERN =
    /^(\/_next\/|\/api\/|\/_vercel\/|.*\.[^/]+$)/;


export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (INTERNAL_PATTERN.test(pathname)) {
        return NextResponse.next();
    }


    const token =
        request.cookies.get('auth_token')?.value;
    const rawRole =
        request.cookies
            .get('user_role')
            ?.value
            ?.trim();

    const role = rawRole
        ? (rawRole.charAt(0).toUpperCase() +
           rawRole.slice(1).toLowerCase()) as AccessRole
        : undefined;

    if (pathname === '/') {
        return NextResponse.redirect(
            new URL(
                token ? '/dashboard' : '/sign-in',
                request.url
            )
        );
    }

    if (
        pathname === '/sign-in' ||
        pathname === '/forgot-password'
    ) {
        if (token) {
            return NextResponse.redirect(
                new URL('/dashboard', request.url)
            );
        }

        return NextResponse.next();
    }


    if (pathname.startsWith('/dashboard')) {
        if (!token) {
            const loginUrl = new URL(
                '/sign-in',
                request.url
            );

            loginUrl.searchParams.set(
                'callbackUrl',
                pathname
            );

            return NextResponse.redirect(loginUrl);
        }

        if (!role) {
            return NextResponse.redirect(
                new URL('/dashboard', request.url)
            );
        }
        if (!isAllowed(role, pathname)) {
            const fallback =
                ROLE_FALLBACK[role] ??
                '/dashboard';

            if (pathname === fallback) {
                return NextResponse.next();
            }

            return NextResponse.redirect(
                new URL(fallback, request.url)
            );
        }

        const response = NextResponse.next();

        response.headers.set(
            'x-middleware-verified',
            '1'
        );

        response.headers.set(
            'x-pathname',
            pathname
        );

        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api/).*)',
    ],
};
