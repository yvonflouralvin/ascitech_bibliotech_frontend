'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircleIcon, BookOpenIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon } from 'lucide-react';

import Button from '@/components/ui/Button';
import ThemeToggle from '@/components/ui/ThemeToggle';
import useAuthentification from '@/lib/hooks/authentification';
import cn from '@/lib/ui/cn';

const HIGHLIGHTS = [
    'Les manuels de votre classe, au même endroit',
    'Téléchargez un livre et lisez-le sans connexion',
    'Reprenez votre lecture page après page',
];

export default function Login() {
    const { login } = useAuthentification({ redirect: false });

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(undefined);

        if (!email.trim() || !password) {
            setError('Renseignez votre email et votre mot de passe.');
            return;
        }

        setIsSubmitting(true);
        try {
            await login({ email: email.trim(), password });
            // Rechargement complet : l'etat local repart d'une session propre.
            window.location.href = '/';
        } catch (e: any) {
            const status = e?.response?.status;
            if (status === 401) setError('Email ou mot de passe incorrect.');
            else if (status === undefined) setError('Serveur injoignable. Vérifiez votre connexion.');
            else setError('Connexion impossible pour le moment. Réessayez.');
            setIsSubmitting(false);
        }
    };

    const inputClass = cn(
        'h-12 w-full rounded-xl border border-line bg-surface pl-11 pr-11 text-sm text-ink',
        'outline-none transition-all duration-200 placeholder:text-ink-subtle',
        'focus:border-primary focus:ring-4 focus:ring-primary/10',
    );

    return (
        <div className="flex min-h-screen bg-canvas">
            {/* Colonne de présentation */}
            <div className="relative hidden w-1/2 overflow-hidden bg-primary lg:flex lg:flex-col lg:justify-between">
                <div
                    aria-hidden
                    className="absolute inset-0 opacity-40"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 22% 18%, rgba(255,255,255,0.35) 0, transparent 45%), radial-gradient(circle at 82% 82%, rgba(0,0,0,0.4) 0, transparent 50%)',
                    }}
                />

                <div className="relative flex items-center gap-3 p-10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="" width={44} height={44} className="rounded-xl bg-white/10 p-1" />
                    <div className="leading-tight text-white">
                        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/70">
                            Ascitech
                        </p>
                        <p className="text-lg font-semibold">Bibliotech</p>
                    </div>
                </div>

                <div className="relative px-10 pb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="max-w-md text-balance text-3xl font-semibold leading-tight text-white"
                    >
                        Votre bibliothèque scolaire, partout avec vous.
                    </motion.h2>

                    <ul className="mt-8 space-y-3.5">
                        {HIGHLIGHTS.map((item, index) => (
                            <motion.li
                                key={item}
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    delay: 0.18 + index * 0.12,
                                    duration: 0.5,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                                className="flex items-center gap-3 text-[14px] text-white/85"
                            >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/15">
                                    <BookOpenIcon size={14} />
                                </span>
                                {item}
                            </motion.li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Colonne du formulaire */}
            <div className="flex w-full flex-col lg:w-1/2">
                <div className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-2.5 lg:invisible">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.png" alt="" width={34} height={34} className="rounded-lg" />
                        <span className="font-semibold text-ink">Bibliotech</span>
                    </div>
                    <ThemeToggle />
                </div>

                <div className="flex flex-1 items-center justify-center px-6 pb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full max-w-sm"
                    >
                        <h1 className="text-2xl font-semibold tracking-tight text-ink">Se connecter</h1>
                        <p className="mt-1.5 text-[13px] text-ink-muted">
                            Utilisez l’adresse email fournie par votre établissement.
                        </p>

                        <form onSubmit={handleSubmit} className="mt-7 space-y-3.5">
                            <div className="relative">
                                <MailIcon
                                    size={17}
                                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle"
                                />
                                <input
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="prenom.nom@exemple.cd"
                                    aria-label="Adresse email"
                                    className={inputClass}
                                />
                            </div>

                            <div className="relative">
                                <LockIcon
                                    size={17}
                                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle"
                                />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Mot de passe"
                                    aria-label="Mot de passe"
                                    className={inputClass}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((current) => !current)}
                                    aria-label={
                                        showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-subtle transition-colors hover:text-ink"
                                >
                                    {showPassword ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
                                </button>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.22 }}
                                        className="overflow-hidden"
                                    >
                                        <p
                                            role="alert"
                                            className="flex items-start gap-2 rounded-xl bg-danger-soft px-3.5 py-2.5 text-[12px] text-danger"
                                        >
                                            <AlertCircleIcon size={14} className="mt-0.5 shrink-0" />
                                            {error}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <Button type="submit" size="lg" block isLoading={isSubmitting}>
                                {isSubmitting ? 'Connexion…' : 'Se connecter'}
                            </Button>
                        </form>

                        <p className="mt-8 text-center text-[11px] text-ink-subtle">
                            Mot de passe oublié ? Contactez l’administration de votre école.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
