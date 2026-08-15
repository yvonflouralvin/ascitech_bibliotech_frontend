'use client';

import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

import cn from '@/lib/ui/cn';

type Variant = 'surface' | 'ghost' | 'glass';

const VARIANTS: Record<Variant, string> = {
    surface: 'bg-surface border border-line text-ink-muted hover:text-ink hover:border-ink-subtle',
    ghost: 'text-ink-muted hover:bg-surface-muted hover:text-ink',
    glass: 'bg-black/45 text-white backdrop-blur-md hover:bg-black/65',
};

export interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref' | 'children'> {
    children?: React.ReactNode;
    label: string;
    variant?: Variant;
    size?: number;
    active?: boolean;
}

/** Bouton carre destine a une seule icone ; `label` alimente l'accessibilite. */
const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
    { label, variant = 'ghost', size = 40, active, className, children, ...rest },
    ref,
) {
    return (
        <motion.button
            ref={ref}
            type="button"
            aria-label={label}
            title={label}
            aria-pressed={active}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 460, damping: 26 }}
            style={{ width: size, height: size }}
            className={cn(
                'inline-flex items-center justify-center rounded-xl shrink-0',
                'transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
                VARIANTS[variant],
                active && 'text-primary',
                className,
            )}
            {...rest}
        >
            {children}
        </motion.button>
    );
});

export default IconButton;
