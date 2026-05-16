'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ToastProvider } from './ToastProvider';
import dynamic from 'next/dynamic';
import Navbar from './Navbar';
import { ThemeProvider } from './ThemeProvider';

const ParticleField = dynamic(() => import('./ParticleField'), { ssr: false });

export function Header() {
    return (
        <header className="header">
            <div className="container">
                <nav className="nav">
                    <Link href="/" className="logo">
                        <span className="logo-icon">✦</span>
                        <span className="logo-text">OriginLayer</span>
                    </Link>
                    <div className="nav-links">
                        <Link href="/analyze" className="nav-link">Analyze</Link>
                        <Link href="/features" className="nav-link">Features</Link>
                        <Link href="/working-model" className="nav-link">How It Works</Link>
                        <Link href="/novelty" className="nav-link">Research</Link>
                    </div>
                </nav>
            </div>
        </header>
    );
}

export function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <span className="logo-icon">✦</span>
                        <span>OriginLayer</span>
                    </div>
                    <div className="footer-info">
                        <p>Forensic Analysis of AI-Generated Content</p>
                        <p className="credits">
                            Built by Aashish Kumar Mahato, Rahul Yadav &amp; Bibek Gami
                        </p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 OriginLayer. Research Project.</p>
                </div>
            </div>
        </footer>
    );
}

export function BackgroundEffects() {
    return (
        <div className="bg-effects" aria-hidden="true">
            <div className="gradient-orb orb-1"></div>
            <div className="gradient-orb orb-2"></div>
            <div className="gradient-orb orb-3"></div>
            <div className="grid-pattern"></div>
        </div>
    );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isCustomLayoutRoute = pathname === '/' || pathname === '/features' || pathname === '/working-model' || pathname === '/novelty' || pathname === '/analyze';

    return (
        <ThemeProvider>
            <div className="app-wrapper">
                <ToastProvider />
                <ParticleField
                    particleCount={60}
                    speed={0.2}
                    interactive={true}
                    connectDistance={100}
                />
                {!isCustomLayoutRoute && <Header />}
                {isCustomLayoutRoute && <Navbar />}
                <main className={isCustomLayoutRoute ? "" : "main-content"} style={{ position: 'relative', zIndex: 1 }}>
                    {children}
                </main>
                {!isCustomLayoutRoute && <Footer />}
            </div>
        </ThemeProvider>
    );
}
