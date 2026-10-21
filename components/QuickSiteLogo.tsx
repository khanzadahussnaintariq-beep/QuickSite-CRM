import Image from 'next/image';

interface QuickSiteLogoProps {
    size?: 'sm' | 'md' | 'lg';
    layout?: 'row' | 'stacked';
    label?: string;
    descriptor?: string;
    tagline?: string;
    compactOnMobile?: boolean;
    className?: string;
}

const logoSizes = { sm: 36, md: 48, lg: 150 } as const;

export default function QuickSiteLogo({
    size = 'md',
    layout = 'row',
    label = 'QuickSite',
    descriptor,
    tagline,
    compactOnMobile = false,
    className = '',
}: QuickSiteLogoProps) {
    const logoSize = logoSizes[size];
    const isStacked = layout === 'stacked';

    return (
        <div className={`flex ${isStacked ? 'flex-col text-center gap-4' : 'items-center text-left gap-3'} ${className}`}>
            <Image
                src="/quicksite-mark.svg"
                width={logoSize}
                height={logoSize}
                alt="QuickSite Technologies"
                priority={size === 'lg'}
                style={{ width: logoSize, height: logoSize }}
                className="shrink-0 drop-shadow-[0_0_18px_rgba(192,38,211,0.2)]"
            />
            <div className={compactOnMobile ? 'hidden sm:block' : ''}>
                {label && (
                    <p className={`${isStacked ? 'text-2xl sm:text-3xl font-black tracking-[0.14em]' : 'text-sm font-bold tracking-tight'} text-foreground whitespace-nowrap`}>
                        {label}
                    </p>
                )}
                {descriptor && (
                    <p className={`${isStacked ? 'mt-1 text-[10px] font-bold tracking-[0.42em]' : 'text-[9px] font-bold tracking-[0.2em]'} text-primary uppercase whitespace-nowrap`}>
                        {descriptor}
                    </p>
                )}
                {tagline && (
                    <p className="mt-3 text-xs sm:text-sm tracking-[0.2em] text-foreground/70 whitespace-nowrap">
                        {tagline}
                    </p>
                )}
            </div>
        </div>
    );
}