'use client';

import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const handleCtaClick = () => {
        router.push('/analyze');
    };

    return (
        <nav className="landing-nav">
            <div className="nav-content">
                {/* Logo */}
                <Link href="/" className="logo">
                    <div className="logo-orb"></div>
                    <span className="logo-text">OriginLayer</span>
                </Link>

                {/* Center Nav */}
                <div className="nav-links desktop-only">
                    <Link href="/features" className={`nav-link ${pathname === '/features' ? 'active' : ''}`}>
                        Features
                    </Link>
                    <Link href="/working-model" className={`nav-link ${pathname === '/working-model' ? 'active' : ''}`}>
                        Working Model
                    </Link>
                    <Link href="/novelty" className={`nav-link ${pathname === '/novelty' ? 'active' : ''}`}>
                        Novelty
                    </Link>
                </div>

                {/* CTA Button */}
                <div className="nav-right desktop-only">
                    <button className="cta-btn" onClick={handleCtaClick}>Analyse</button>
                </div>

                {/* Mobile Menu */}
                <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            <style jsx>{`
        .landing-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 16px 24px;
          display: flex;
          justify-content: center;
        }

        .nav-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(28, 28, 32, 0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 10px 12px 10px 20px;
          width: 100%;
          max-width: 900px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.5);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: white;
        }

        .logo-orb {
          width: 28px;
          height: 28px;
          background: linear-gradient(145deg, #f0f0f0 0%, #888 50%, #555 100%);
          border-radius: 50%;
          box-shadow: inset 0 -4px 8px rgba(0,0,0,0.4), inset 0 4px 8px rgba(255,255,255,0.3);
          position: relative;
        }

        .logo-orb::before {
          content: '';
          position: absolute;
          top: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 50%;
          height: 6px;
          background: rgba(255,255,255,0.7);
          border-radius: 50%;
          filter: blur(1px);
        }

        .logo-text {
          font-size: 1.1rem;
          font-weight: 500;
          letter-spacing: -0.02em;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .nav-link {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.95rem;
          font-weight: 400;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: all 0.2s;
          font-family: inherit;
          padding: 6px 12px;
          border-radius: 99px;
          text-decoration: none;
        }

        .nav-link:hover {
          color: white;
          background: rgba(255,255,255,0.05);
        }
        
        .nav-link.active {
          color: white;
          background: rgba(255,255,255,0.1);
          font-weight: 500;
        }

        .cta-btn {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.18);
          padding: 10px 22px;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cta-btn:hover {
          background: rgba(255, 255, 255, 0.18);
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .nav-content { max-width: 100%; padding: 12px 16px; border-radius: 0; }
          .landing-nav { padding: 0; }
          .desktop-only { display: none !important; }
          .mobile-menu-btn { display: flex; }
        }
      `}</style>
        </nav>
    );
}
