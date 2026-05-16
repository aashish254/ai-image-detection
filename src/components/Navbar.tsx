'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles, Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const navLinks = [
  { href: '/features', label: 'Features' },
  { href: '/working-model', label: 'How It Works' },
  { href: '/novelty', label: 'Research' },
];

export default function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <motion.nav
        className="navbar"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="nav-inner">
          {/* Logo */}
          <Link href="/" className="logo">
            <div className="logo-icon">
              <Sparkles size={16} />
            </div>
            <span className="logo-text">OriginLayer</span>
            <span className="logo-version">v2</span>
          </Link>

          {/* Desktop Links */}
          <div className="nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${pathname === link.href ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="nav-actions">
            {/* Premium Theme Toggle — Pill Switch */}
            <button
              className="theme-switch"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              data-theme-active={theme}
            >
              <div className="switch-track">
                <span className="switch-icon sun-icon">
                  <Sun size={12} strokeWidth={2.5} />
                </span>
                <span className="switch-icon moon-icon">
                  <Moon size={12} strokeWidth={2.5} />
                </span>
                <div className={`switch-thumb ${theme === 'light' ? 'thumb-right' : ''}`} />
              </div>
            </button>

            <Link href="/analyze" className="nav-cta">
              <span className="cta-dot" />
              Analyze
            </Link>

            <button
              className="mobile-toggle"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              className="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`mobile-link ${pathname === link.href ? 'active' : ''}`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/analyze"
                className="mobile-cta"
                onClick={() => setIsMobileOpen(false)}
              >
                Analyze Image
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          margin: 0;
          padding: 0;
          background: var(--nav-bg, rgba(5, 5, 7, 0.8));
          backdrop-filter: blur(24px) saturate(1.4);
          -webkit-backdrop-filter: blur(24px) saturate(1.4);
          border-bottom: 1px solid var(--nav-border, rgba(255, 255, 255, 0.06));
          transition: background 0.3s ease, border-color 0.3s ease;
        }

        .nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* Logo */
        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: var(--text-primary, white);
        }

        .logo-icon {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 9px;
          color: white;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
        }

        .logo-text {
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .logo-version {
          font-size: 0.6rem;
          padding: 1px 5px;
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          border-radius: 4px;
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        /* Desktop Links */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .nav-link {
          padding: 6px 14px;
          font-size: 0.84rem;
          color: var(--text-muted, rgba(255, 255, 255, 0.5));
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.2s ease;
          font-weight: 450;
          letter-spacing: 0.01em;
        }

        .nav-link:hover {
          color: var(--text-primary, rgba(255, 255, 255, 0.85));
          background: var(--hover-bg, rgba(255, 255, 255, 0.05));
        }

        .nav-link.active {
          color: var(--text-primary, white);
          background: var(--active-bg, rgba(255, 255, 255, 0.08));
          font-weight: 500;
        }

        /* Actions */
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* ==============================
           Premium Pill Theme Switch
           ============================== */
        .theme-switch {
          position: relative;
          width: 56px;
          height: 28px;
          padding: 0;
          border: none;
          background: none;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }

        .switch-track {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50px;
          background: rgba(99, 102, 241, 0.12);
          border: 1.5px solid rgba(99, 102, 241, 0.2);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 6px;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .theme-switch:hover .switch-track {
          border-color: rgba(99, 102, 241, 0.45);
          background: rgba(99, 102, 241, 0.18);
          box-shadow: 0 0 12px rgba(99, 102, 241, 0.15);
        }

        .switch-thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #818cf8, #6366f1);
          box-shadow: 0 1px 4px rgba(99, 102, 241, 0.35), 0 0 8px rgba(99, 102, 241, 0.15);
          transition: left 0.35s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease, box-shadow 0.3s ease;
          z-index: 2;
        }

        .switch-thumb.thumb-right {
          left: calc(100% - 23px);
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          box-shadow: 0 1px 4px rgba(99, 102, 241, 0.4), 0 0 10px rgba(99, 102, 241, 0.2);
        }

        .theme-switch:hover .switch-thumb {
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.5), 0 0 14px rgba(99, 102, 241, 0.25);
          transform: scale(1.05);
        }

        .theme-switch:active .switch-thumb {
          transform: scale(0.92);
        }

        .switch-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          z-index: 1;
          transition: color 0.3s ease, opacity 0.3s ease;
        }

        /* Dark mode: sun faded purple, moon faded behind thumb */
        .theme-switch[data-theme-active="dark"] .sun-icon {
          color: #a5b4fc;
          opacity: 0.75;
        }
        .theme-switch[data-theme-active="dark"] .moon-icon {
          color: #6366f1;
          opacity: 0.4;
        }

        /* Light mode: sun faded purple, moon bolder purple */
        .theme-switch[data-theme-active="light"] .sun-icon {
          color: #818cf8;
          opacity: 0.65;
        }
        .theme-switch[data-theme-active="light"] .moon-icon {
          color: #4f46e5;
          opacity: 0.8;
        }

        /* Light mode track styling */
        :global([data-theme="light"]) .switch-track {
          background: rgba(99, 102, 241, 0.08);
          border-color: rgba(99, 102, 241, 0.2);
        }

        :global([data-theme="light"]) .theme-switch:hover .switch-track {
          background: rgba(99, 102, 241, 0.12);
          border-color: rgba(99, 102, 241, 0.35);
        }

        /* CTA */
        .nav-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 16px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1));
          color: #a5b4fc;
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 9px;
          font-size: 0.82rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.25s ease;
        }

        .cta-dot {
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse-dot 2s infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50% { opacity: 0.7; box-shadow: 0 0 0 4px rgba(34,197,94,0); }
        }

        .nav-cta:hover {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(139, 92, 246, 0.18));
          border-color: rgba(99, 102, 241, 0.35);
          color: #c7d2fe;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.2);
        }

        /* Mobile Toggle */
        .mobile-toggle {
          display: none;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: transparent;
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mobile-toggle:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        /* Mobile Menu */
        .mobile-menu {
          display: none;
          flex-direction: column;
          padding: 8px 20px 16px;
          border-top: 1px solid var(--glass-border);
          overflow: hidden;
        }

        .mobile-link {
          padding: 12px 16px;
          font-size: 0.88rem;
          color: var(--text-secondary);
          text-decoration: none;
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .mobile-link:hover,
        .mobile-link.active {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        .mobile-cta {
          margin-top: 8px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
          text-align: center;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.88rem;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .mobile-toggle { display: flex; }
          .mobile-menu { display: flex; }
          .nav-cta { display: none; }
        }
      `}</style>
    </>
  );
}
