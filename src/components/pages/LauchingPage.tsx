'use client';

import React from 'react';

import LibraryView from './LibraryView';

/** Page d'accueil : tout le catalogue accessible a l'eleve. */
export default function LauchingPage() {
    return <LibraryView title="Catalogue" initialScope="all" />;
}
