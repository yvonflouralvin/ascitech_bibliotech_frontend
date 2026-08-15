'use client';

import React from 'react';

import LibraryView from '@/components/pages/LibraryView';

export default function Page() {
    return <LibraryView title="Hors ligne" initialScope="offline" lockScope />;
}
