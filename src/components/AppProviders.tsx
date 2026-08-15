'use client';

import React from 'react';
import { Provider } from 'react-redux';

import { ThemeProvider } from '@/lib/hooks/useTheme';
import { store } from '@/lib/shared/store';

export default function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <Provider store={store}>{children}</Provider>
        </ThemeProvider>
    );
}
