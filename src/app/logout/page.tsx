'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import Spinner from '@/components/ui/Spinner';
import useAuthentification from '@/lib/hooks/authentification';

/**
 * Page de deconnexion.
 *
 * Elle existait dans le code (`logout()` y redirigeait) mais pas dans le
 * routeur : la deconnexion aboutissait sur une 404 sans jamais purger la
 * session. Le refresh token est desormais revoque cote serveur, puis les
 * cookies sont effaces avant le retour vers la page de connexion.
 */
export default function Page() {
    const router = useRouter();
    const { logout } = useAuthentification({ redirect: false });
    const started = useRef(false);

    useEffect(() => {
        if (started.current) return;
        started.current = true;

        logout().finally(() => router.replace('/login'));
    }, [logout, router]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-canvas text-ink-muted">
            <Spinner size={26} />
            <p className="text-[13px]">Déconnexion en cours…</p>
        </div>
    );
}
