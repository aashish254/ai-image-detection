'use client';

import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';

export default function NoveltyPage() {
  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="container">
        <section className="hero-section">
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="hero-title"
          >
            Beyond Detection. <br />
            <span className="text-gradient">True Authentication.</span>
          </motion.h1>

          <motion.div
            className="hero-description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p>
              While traditional detectors rely on simple artifacts, OriginLayer introduces a
              paradigm shift. We don&apos;t just look for what&apos;s fake; we verify what&apos;s real.
              By analyzing the subtle interplay of photon noise, sensor patterns, and
              scene physics, we establish a chain of custody for digital reality.
            </p>
          </motion.div>
        </section>

        <section className="comparison-section">
          <motion.div
            className="comparison-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="card-header">
              <h2>The Legacy Approach</h2>
            </div>
            <div className="card-body">
              <ul>
                <li><span className="bullet">×</span> Simple artifact detection</li>
                <li><span className="bullet">×</span> High false positive rates</li>
                <li><span className="bullet">×</span> Vulnerable to compression</li>
                <li><span className="bullet">×</span> Black-box decision making</li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            className="comparison-card highlight"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="card-header">
              <h2>The OriginLayer Standard</h2>
            </div>
            <div className="card-body">
              <ul>
                <li><span className="bullet check">✓</span> Multi-modal forensics engine</li>
                <li><span className="bullet check">✓</span> 99.8% Accuracy on benchmark</li>
                <li><span className="bullet check">✓</span> Robust against re-encoding</li>
                <li><span className="bullet check">✓</span> Explainable AI reports</li>
              </ul>
            </div>
          </motion.div>
        </section>
      </main>

      <style jsx>{`
        .page-wrapper {
            min-height: 100vh;
            background: #050507;
            color: white;
            padding-top: 140px;
            padding-bottom: 80px;
        }

        .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 0 24px;
        }

        .hero-section {
            text-align: center;
            margin-bottom: 120px;
        }

        .hero-title {
            font-size: clamp(3rem, 6vw, 5.5rem);
            font-weight: 700;
            line-height: 1.1;
            margin-bottom: 32px;
            letter-spacing: -0.02em;
        }

        .text-gradient {
            background: linear-gradient(135deg, #fff 0%, #888 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .hero-description {
            max-width: 700px;
            margin: 0 auto;
            font-size: 1.25rem;
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.7);
        }

        .comparison-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
        }

        .comparison-card {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 32px;
            padding: 40px;
            position: relative;
            overflow: hidden;
        }

        .comparison-card.highlight {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        .comparison-card.highlight::before {
             content: '';
             position: absolute;
             top: 0; left: 0; right: 0; height: 1px;
             background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
        }

        .card-header h2 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 32px;
            color: white;
        }

        ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        li {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            font-size: 1.1rem;
            color: rgba(255, 255, 255, 0.8);
        }

        .bullet {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            margin-right: 16px;
            font-weight: 600;
            font-size: 0.9rem;
            color: rgba(255,255,255,0.5);
        }

        .bullet.check {
            background: #fff;
            color: #000;
        }

        @media (max-width: 768px) {
            .comparison-section {
                grid-template-columns: 1fr;
            }
        }
      `}</style>
    </div>
  );
}
