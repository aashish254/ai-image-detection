'use client';

import Link from 'next/link';
import { ToastProvider } from './ToastProvider';

export function Header() {
    return (
        <header className="header">
            <div className="container">
                <nav className="nav">
                    <Link href="/" className="logo">
                        <span className="logo-icon">🔍</span>
                        <span className="logo-text">
                            <span className="gradient-text">AI Forensic</span> Analyzer
                        </span>
                    </Link>
                    <div className="nav-links">
                        <a href="#analyze" className="nav-link">Analyze</a>
                        <a href="#features" className="nav-link">Features</a>
                        <a href="#research" className="nav-link">Research</a>
                        <a href="#team" className="nav-link">Team</a>
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
                        <span className="logo-icon">🔍</span>
                        <span>AI Forensic Analyzer</span>
                    </div>
                    <div className="footer-info">
                        <p>Forensic Analysis of AI-Generated Content via API Orchestration</p>
                        <p className="credits">
                            Built by Aashish Kumar Mahato, Rahul Yadav & Bibek Gami
                        </p>
                    </div>
                    <div className="footer-links">
                        <a href="#privacy">Privacy</a>
                        <a href="#terms">Terms</a>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 AI Forensic Analyzer. Research Project.</p>
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
    return (
        <div className="app-wrapper">
            <ToastProvider />
            <Header />
            <main className="main-content">
                {children}
            </main>
            <Footer />
            <BackgroundEffects />
        </div>
    );
}
