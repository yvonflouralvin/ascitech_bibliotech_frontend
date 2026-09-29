'use client';

import React from 'react';
import { useParams } from 'next/navigation';

import LibraryView from '@/components/pages/LibraryView';

export default function Page() {
    const params = useParams<{ slug: string }>();
    const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

    // Le titre definitif est le nom du domaine, que seule la fiche des livres
    // porte : `LibraryView` le resout depuis le catalogue et retombe sur ce
    // libelle generique le temps du chargement.
    return <LibraryView title="Domaine" initialCategory={slug} lockCategory />;
}
