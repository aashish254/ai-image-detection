'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const navLinks = [
  { href: '/features', label: 'Features' },
  { href: '/working-model', label: 'Method' },
  { href: '/novelty', label: 'Research' },
];

export default function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <nav className="navbar">
        <div className="nav-inner">
          <Link href="/" className="ol-logo">
            <span className="logo-text">OriginLayer</span>
            <span className="logo-version">v2.0</span>
          </Link>

          <div className="nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`ol-nav-link ${pathname === link.href ? 'active' : ''}`}
                aria-current={pathname === link.href ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/analyze"
              className={`ol-nav-link ${pathname === '/analyze' ? 'active' : ''}`}
              aria-current={pathname === '/analyze' ? 'page' : undefined}
            >
              Analyze
            </Link>
          </div>

          <div className="nav-actions">
            <span className="nav-rev">7 detectors, rev 2.0.0</span>

            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <Link href="/analyze" className="ol-nav-cta">
              Examine an image
            </Link>

            <button
              className="mobile-toggle"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileOpen}
            >
              {isMobileOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isMobileOpen && (
            <motion.div
              className="ol-mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <div className="mobile-menu-inner">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`ol-mobile-link ${pathname === link.href ? 'active' : ''}`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="/analyze" className="ol-mobile-cta" onClick={() => setIsMobileOpen(false)}>
                  Examine an image
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: var(--nav-bg);
          border-bottom: 1px solid var(--nav-border);
        }

        .nav-inner {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 32px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
        }

        /* next/link and motion.div are custom components, so styled-jsx cannot
           inject its scope class onto their DOM node. These carry the ol- prefix
           and are declared :global to stay collision-free with globals.css. */
        :global(.ol-logo) {
          display: flex;
          align-items: baseline;
          gap: 9px;
          color: var(--ink);
        }

        :global(.ol-logo:hover) {
          color: var(--ink);
        }

        .logo-text {
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .logo-version {
          font-family: var(--font-mono);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--muted);
          border: 1px solid var(--rule);
          border-radius: 2px;
          padding: 2px 5px;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 26px;
        }

        :global(.ol-nav-link) {
          font-size: 0.875rem;
          color: var(--graphite);
          padding: 4px 0;
        }

        :global(.ol-nav-link:hover) {
          color: var(--ink);
        }

        :global(.ol-nav-link.active) {
          color: var(--ink);
          font-weight: 500;
          box-shadow: inset 0 -2px 0 var(--ink);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .nav-rev {
          font-family: var(--font-mono);
          font-size: 0.875rem;
          color: var(--muted);
          padding-right: 14px;
          border-right: 1px solid var(--rule);
        }

        .theme-toggle {
          width: 32px;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid var(--rule);
          border-radius: 3px;
          color: var(--graphite);
          cursor: pointer;
          transition: color 0.12s ease, border-color 0.12s ease;
        }

        .theme-toggle:hover {
          color: var(--ink);
          border-color: var(--rule-strong);
        }

        :global(.ol-nav-cta) {
          display: inline-flex;
          align-items: center;
          padding: 8px 14px;
          background: var(--btn-bg);
          color: var(--btn-fg);
          border-radius: 3px;
          font-size: 0.875rem;
          font-weight: 500;
          white-space: nowrap;
        }

        :global(.ol-nav-cta:hover) {
          background: var(--graphite);
          color: var(--btn-fg);
        }

        .mobile-toggle {
          display: none;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: transparent;
          border: 1px solid var(--rule);
          border-radius: 3px;
          color: var(--graphite);
          cursor: pointer;
        }

        :global(.ol-mobile-menu) {
          overflow: hidden;
          border-top: 1px solid var(--rule);
          background: var(--sheet);
        }

        .mobile-menu-inner {
          max-width: 1120px;
          margin: 0 auto;
          padding: 8px 24px 20px;
          display: flex;
          flex-direction: column;
        }

        :global(.ol-mobile-link) {
          padding: 11px 0;
          font-size: 0.9375rem;
          color: var(--graphite);
          border-bottom: 1px solid var(--rule-soft);
        }

        :global(.ol-mobile-link.active) {
          color: var(--ink);
          font-weight: 500;
        }

        :global(.ol-mobile-cta) {
          margin-top: 16px;
          padding: 12px 16px;
          background: var(--btn-bg);
          color: var(--btn-fg);
          text-align: center;
          border-radius: 3px;
          font-weight: 500;
          font-size: 0.9375rem;
        }

        @media (max-width: 900px) {
          .nav-rev {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .nav-inner {
            padding: 0 20px;
          }

          .nav-links {
            display: none;
          }

          .mobile-toggle {
            display: inline-flex;
          }

          :global(.ol-nav-cta) {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
