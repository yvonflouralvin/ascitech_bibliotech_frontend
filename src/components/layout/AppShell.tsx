'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
    DownloadCloudIcon,
    HeartIcon,
    LibraryIcon,
    LogOutIcon,
    MenuIcon,
    WifiOffIcon,
    XIcon,
} from 'lucide-react';

import IconButton from '@/components/ui/IconButton';
import ThemeToggle from '@/components/ui/ThemeToggle';
import cn from '@/lib/ui/cn';

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
    { href: '/', label: 'Catalogue', icon: <LibraryIcon size={17} /> },
    { href: '/favorites', label: 'Favoris', icon: <HeartIcon size={17} /> },
    { href: '/offline', label: 'Hors ligne', icon: <DownloadCloudIcon size={17} /> },
];

function Brand({ compact }: { compact?: boolean }) {
    return (
        <div className="flex items-center gap-2.5">
            {/* Logo statique de petite taille : l'optimiseur n'apporte rien ici. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" width={compact ? 34 : 40} height={compact ? 34 : 40} className="rounded-lg" />
            <div className="leading-tight">
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-subtle">
                    Ascitech
                </p>
                <p className={cn('font-semibold text-ink', compact ? 'text-[15px]' : 'text-base')}>
                    Bibliotech
                </p>
            </div>
        </div>
    );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname();

    return (
        <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                            'relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium',
                            'transition-colors duration-200',
                            active ? 'text-primary' : 'text-ink-muted hover:bg-surface-muted hover:text-ink',
                        )}
                    >
                        {active && (
                            <motion.span
                                layoutId="nav-active"
                                className="absolute inset-0 rounded-xl bg-primary-soft"
                                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-3">
                            {item.icon}
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}

/** Bandeau affiché lorsque le navigateur passe hors ligne. */
function OfflineBanner() {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const update = () => setIsOffline(!navigator.onLine);
        update();
        window.addEventListener('online', update);
        window.addEventListener('offline', update);
        return () => {
            window.removeEventListener('online', update);
            window.removeEventListener('offline', update);
        };
    }, []);

    return (
        <AnimatePresence>
            {isOffline && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden bg-accent-soft"
                >
                    <p className="flex items-center justify-center gap-2 px-4 py-2 text-[12px] font-medium text-accent">
                        <WifiOffIcon size={14} />
                        Mode hors ligne : seuls les livres téléchargés sont consultables.
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

interface AppShellProps {
    title: string;
    subtitle?: string;
    /** Contenu inséré sous l'en-tête (recherche, filtres…). */
    toolbar?: React.ReactNode;
    children: React.ReactNode;
    onLogout?: () => void;
}

export default function AppShell({ title, subtitle, toolbar, children, onLogout }: AppShellProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const pathname = usePathname();

    // Referme le tiroir lors d'un changement de page.
    useEffect(() => {
        setDrawerOpen(false);
    }, [pathname]);

    // Empêche le défilement de l'arrière-plan quand le tiroir est ouvert.
    useEffect(() => {
        document.body.style.overflow = drawerOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [drawerOpen]);

    const sidebarFooter = (
        <div className="flex items-center gap-2">
            <ThemeToggle />
            {onLogout && (
                <IconButton label="Se déconnecter" variant="surface" onClick={onLogout}>
                    <LogOutIcon size={17} />
                </IconButton>
            )}
        </div>
    );

    return (
        <div className="flex min-h-screen bg-canvas">
            {/* Barre latérale (grand écran) */}
            <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col border-r border-line bg-surface px-4 py-5 lg:flex">
                <Brand />
                <div className="mt-7 flex-1">
                    <NavLinks />
                </div>
                {sidebarFooter}
            </aside>

            {/* Tiroir (mobile) */}
            <AnimatePresence>
                {drawerOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setDrawerOpen(false)}
                            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm lg:hidden"
                            aria-hidden
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
                            className="fixed inset-y-0 left-0 z-50 flex w-[80%] max-w-[300px] flex-col border-r border-line bg-surface px-4 py-5 lg:hidden"
                        >
                            <div className="flex items-center justify-between">
                                <Brand compact />
                                <IconButton
                                    label="Fermer le menu"
                                    variant="ghost"
                                    onClick={() => setDrawerOpen(false)}
                                >
                                    <XIcon size={18} />
                                </IconButton>
                            </div>
                            <div className="mt-7 flex-1">
                                <NavLinks onNavigate={() => setDrawerOpen(false)} />
                            </div>
                            {sidebarFooter}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Colonne principale */}
            <div className="flex min-w-0 flex-1 flex-col">
                <OfflineBanner />

                <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur-xl">
                    <div className="mx-auto flex w-full max-w-[1400px] items-center gap-3 px-4 py-3.5 sm:px-6">
                        <IconButton
                            label="Ouvrir le menu"
                            variant="surface"
                            onClick={() => setDrawerOpen(true)}
                            className="lg:hidden"
                        >
                            <MenuIcon size={18} />
                        </IconButton>

                        <div className="min-w-0 flex-1">
                            <h1 className="truncate text-[17px] font-semibold leading-tight text-ink">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="truncate text-[12px] text-ink-subtle">{subtitle}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-2 lg:hidden">
                            <ThemeToggle />
                        </div>
                    </div>

                    {toolbar && (
                        <div className="mx-auto w-full max-w-[1400px] px-4 pb-3.5 sm:px-6">{toolbar}</div>
                    )}
                </header>

                <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 pb-16 pt-5 sm:px-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
