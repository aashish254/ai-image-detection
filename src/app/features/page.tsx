'use client';

import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Search, Database, Layers, Lock } from 'lucide-react';

export default function FeaturesPage() {
  const features = [
    {
      title: "Real-time Analysis",
      description: "Instant processing of uploaded images with sub-second latency.",
      icon: <Zap size={32} className="text-amber-400" />,
      colSpan: "col-span-2",
      delay: 0.1
    },
    {
      title: "Deepfake Detection",
      description: "Advanced algorithms trained on millions of synthetic images.",
      icon: <ShieldCheck size={32} className="text-emerald-400" />,
      colSpan: "col-span-1",
      delay: 0.2
    },
    {
      title: "Metadata Forensics",
      description: "Analyze EXIF data and hidden markers to trace image origins.",
      icon: <Search size={32} className="text-blue-400" />,
      colSpan: "col-span-1",
      delay: 0.3
    },
    {
      title: "Enterprise API",
      description: "Seamless integration with your existing workflow via RESTful endpoints.",
      icon: <Database size={32} className="text-purple-400" />,
      colSpan: "col-span-2",
      delay: 0.4
    },
    {
      title: "Multi-Layer Scanning",
      description: "Checks for pixel inconsistencies, frequency artifacts, and semantic anomalies.",
      icon: <Layers size={32} className="text-rose-400" />,
      colSpan: "col-span-1",
      delay: 0.5
    },
    {
      title: "Privacy First",
      description: "Images are processed in memory and never stored without explicit consent.",
      icon: <Lock size={32} className="text-teal-400" />,
      colSpan: "col-span-2",
      delay: 0.6
    }
  ];

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="container">
        <header className="page-header">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="section-title"
          >
            Powerful Capabilities.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="section-subtitle"
          >
            Everything you need to secure your visual content pipeline.
          </motion.p>
        </header>

        <div className="bento-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={`feature-card ${feature.colSpan}`}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: feature.delay }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="card-bg"></div>
              <div className="card-content">
                <div className="icon-wrapper">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <style jsx>{`
        .page-wrapper {
            min-height: 100vh;
            background: #050507;
            color: white;
            padding-top: 120px;
            padding-bottom: 80px;
        }

        .container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 24px;
        }

        .page-header {
            text-align: center;
            margin-bottom: 60px;
        }

        .section-title {
            font-size: clamp(2.5rem, 5vw, 4rem);
            font-weight: 600;
            margin-bottom: 16px;
            background: linear-gradient(180deg, #fff 0%, #aaa 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .section-subtitle {
            font-size: 1.2rem;
            color: rgba(255, 255, 255, 0.6);
            max-width: 600px;
            margin: 0 auto;
        }

        .bento-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            auto-rows: minmax(240px, auto);
        }

        .feature-card {
            position: relative;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 24px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.08);
            cursor: default;
        }

        .col-span-2 {
            grid-column: span 2;
        }

        .col-span-1 {
            grid-column: span 1;
        }

        .card-bg {
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at top right, rgba(255,255,255,0.05), transparent 60%);
            opacity: 0.5;
        }

        .card-content {
            position: relative;
            z-index: 10;
            padding: 32px;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .icon-wrapper {
            width: 56px;
            height: 56px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 24px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        h3 {
            font-size: 1.5rem;
            font-weight: 500;
            margin-bottom: 12px;
            color: rgba(255, 255, 255, 0.95);
        }

        p {
            font-size: 1rem;
            color: rgba(255, 255, 255, 0.6);
            line-height: 1.5;
        }

        @media (max-width: 900px) {
            .bento-grid {
                grid-template-columns: 1fr;
            }
            .col-span-2, .col-span-1 {
                grid-column: span 1;
            }
        }
      `}</style>
    </div>
  );
}
