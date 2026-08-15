'use client';

import { useEffect, useRef, useState } from 'react';

interface UseInViewOptions {
    /** Marge de declenchement : charge un peu avant l'entree a l'ecran. */
    rootMargin?: string;
    /** Une fois vrai, reste vrai (utile pour un chargement unique). */
    once?: boolean;
}

/**
 * Detecte l'entree d'un element dans le viewport.
 *
 * Sert a ne telecharger la couverture d'un livre que lorsque sa vignette
 * devient visible : le catalogue contient des dizaines d'images base64, les
 * charger toutes d'emblee sature la connexion.
 */
export default function useInView<T extends HTMLElement>({
    rootMargin = '300px',
    once = true,
}: UseInViewOptions = {}) {
    const ref = useRef<T | null>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // Navigateur sans IntersectionObserver : on charge directement.
        if (typeof IntersectionObserver === 'undefined') {
            setInView(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (!entry) return;

                if (entry.isIntersecting) {
                    setInView(true);
                    if (once) observer.disconnect();
                } else if (!once) {
                    setInView(false);
                }
            },
            { rootMargin },
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [rootMargin, once]);

    return { ref, inView };
}
