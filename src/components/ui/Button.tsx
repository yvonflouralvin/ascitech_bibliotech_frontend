'use client';

import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

import cn from '@/lib/ui/cn';
import Spinner from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
    primary:
        'bg-primary text-primary-foreground shadow-card hover:bg-primary-strong disabled:hover:bg-primary',
    secondary:
        'bg-surface text-ink border border-line hover:bg-surface-muted disabled:hover:bg-surface',
    ghost: 'bg-transparent text-ink-muted hover:bg-surface-muted hover:text-ink',
    danger: 'bg-danger-soft text-danger hover:bg-danger hover:text-white',
};

const SIZES: Record<Size, string> = {
    sm: 'h-9 px-3.5 text-[13px] gap-1.5 rounded-lg',
    md: 'h-11 px-5 text-sm gap-2 rounded-xl',
    lg: 'h-12 px-6 text-[15px] gap-2.5 rounded-xl',
};

// `children` est reduit a ReactNode : framer-motion y autorise aussi des
// MotionValue, ce qui n'a pas de sens pour un libelle de bouton.
export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref' | 'children'> {
    children?: React.ReactNode;
    variant?: Variant;
    size?: Size;
    isLoading?: boolean;
    /** Occupe toute la largeur disponible. */
    block?: boolean;
    icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    { variant = 'primary', size = 'md', isLoading, block, icon, className, children, disabled, ...rest },
    ref,
) {
    return (
        <motion.button
            ref={ref}
            type="button"
            whileHover={disabled || isLoading ? undefined : { y: -1 }}
            whileTap={disabled || isLoading ? undefined : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            disabled={disabled || isLoading}
            className={cn(
                'inline-flex items-center justify-center font-medium select-none',
                'transition-colors duration-200',
                'disabled:opacity-55 disabled:cursor-not-allowed',
                VARIANTS[variant],
                SIZES[size],
                block && 'w-full',
                className,
            )}
            {...rest}
        >
            {isLoading ? <Spinner size={size === 'sm' ? 14 : 16} /> : icon}
            {children}
        </motion.button>
    );
});

export default Button;
