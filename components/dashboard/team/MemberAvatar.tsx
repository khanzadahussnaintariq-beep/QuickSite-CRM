'use client';

import { useSignedUrl } from '@/lib/hooks/useSignedUrl';

export default function MemberAvatar({ user, size = 20 }: { user: any; size?: number }) {
    const avatarUrl = useSignedUrl(user?.avatar || '');
    const dimension = `${size * 0.25}rem`;

    if (avatarUrl) {
        return (
            <div
                className="rounded-2xl overflow-hidden border border-primary/20 shrink-0"
                style={{ width: dimension, height: dimension }}
            >
                <img src={avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
            </div>
        );
    }

    return (
        <div
            className="rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl font-black text-primary shadow-sm shrink-0"
            style={{ width: dimension, height: dimension }}
        >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
    );
}