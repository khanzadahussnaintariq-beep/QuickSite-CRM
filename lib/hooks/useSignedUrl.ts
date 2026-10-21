'use client';

import { useState, useEffect } from 'react';
import { getSignedImageUrl } from '@/lib/s3';

export function useSignedUrl(keyOrUrl: string | null | undefined): string {
  const [resolvedUrl, setResolvedUrl] = useState<string>(() => {
    if (!keyOrUrl) return '';
    if (keyOrUrl.startsWith('http') || keyOrUrl.startsWith('data:')) return keyOrUrl;
    return '';
  });

  useEffect(() => {
    if (!keyOrUrl) { setResolvedUrl(''); return; }
    if (keyOrUrl.startsWith('http') || keyOrUrl.startsWith('data:')) {
      setResolvedUrl(keyOrUrl);
      return;
    }
    let cancelled = false;
    getSignedImageUrl(keyOrUrl).then(url => {
      if (!cancelled) setResolvedUrl(url);
    }).catch(() => {
      if (!cancelled) setResolvedUrl('');
    });
    return () => { cancelled = true; };
  }, [keyOrUrl]);

  return resolvedUrl;
}
