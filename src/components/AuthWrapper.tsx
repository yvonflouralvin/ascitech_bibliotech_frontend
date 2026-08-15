'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

import Spinner from '@/components/ui/Spinner';
import useAuthentification from '@/lib/hooks/authentification';

/** Routes affichables sans session valide. */
const PUBLIC_PATHS = ['/login', '/logout'];

/**
 * Garde d'authentification : n'affiche le contenu protege qu'une fois la
 * session verifiee, et laisse passer les pages publiques.
 */
export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isAuthenticated, isAuthChecked } = useAuthentification({ redirect: true });

    if (PUBLIC_PATHS.includes(pathname)) {
        return <>{children}</>;
    }

    if (!isAuthChecked) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-canvas text-ink-muted">
                <Spinner size={26} label="Vérification de la session" />
            </div>
        );
    }

    // Non authentifie : le hook a deja declenche la redirection vers /login.
    if (!isAuthenticated) return null;

    return <>{children}</>;
}
