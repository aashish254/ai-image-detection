'use client';

import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';

export default function WorkingModelPage() {
  const steps = [
    {
      id: "01",
      title: "Image Ingestion",
      description: "Securely upload high-resolution images. Our system accepts formats including JPG, PNG, WEBP, and TIFF to ensure no detail is lost during compression."
    },
    {
      id: "02",
      title: "Spectral Analysis",
      description: "We decompose the image into frequency domains to identify unnatural artifacts often left behind by generative adversarial networks (GANs) and diffusion models."
    },
    {
      id: "03",
      title: "Semantic Consistency",
      description: "Deep learning models verify lighting, shadows, and reflections. Inconsistencies in physics are primary indicators of synthetic generation."
    },
    {
      id: "04",
      title: "Verdict Generation",
      description: "A comprehensive probability score is calculated. We provide a detailed heatmap overlaying the original image to pinpoint manipulated regions."
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
            How It Works.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="section-subtitle"
          >
            A look inside our multi-modal detection engine.
          </motion.p>
        </header>

        <div className="timeline">
          <div className="timeline-line"></div>
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="timeline-item"
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="step-number">{step.id}</div>
              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
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
            max-width: 900px;
            margin: 0 auto;
            padding: 0 24px;
        }

        .page-header {
            text-align: center;
            margin-bottom: 80px;
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

        .timeline {
            position: relative;
            padding: 40px 0;
        }

        .timeline-line {
            position: absolute;
            left: 50%;
            top: 0;
            bottom: 0;
            width: 1px;
            background: linear-gradient(180deg, transparent, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0.2) 80%, transparent);
            transform: translateX(-50%);
        }

        .timeline-item {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 100px;
            position: relative;
        }

        .step-number {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            width: 50px;
            height: 50px;
            background: #050507;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.8);
            z-index: 10;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
        }

        .step-content {
            width: 45%;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            padding: 32px;
            backdrop-filter: blur(10px);
        }

        .timeline-item:nth-child(even) {
            flex-direction: row-reverse;
        }

        .timeline-item:nth-child(even) .step-content {
            margin-right: auto;
            margin-left: 0;
        }

        .timeline-item:nth-child(odd) .step-content {
            margin-left: auto;
            margin-right: 0;
        }

        h3 {
            font-size: 1.5rem;
            font-weight: 500;
            margin-bottom: 12px;
            color: white;
        }

        p {
            font-size: 1rem;
            color: rgba(255, 255, 255, 0.6);
            line-height: 1.6;
        }

        @media (max-width: 768px) {
            .timeline-line {
                left: 20px;
            }
            .timeline-item {
                flex-direction: column !important;
                align-items: flex-start;
                padding-left: 60px;
            }
            .step-number {
                left: 20px;
                transform: translateX(-50%);
            }
            .step-content {
                width: 100%;
                margin: 0 !important;
            }
        }
      `}</style>
    </div>
  );
}
