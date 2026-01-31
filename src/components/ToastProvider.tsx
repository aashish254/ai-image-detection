'use client';

import { Toaster, toast } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertTriangle, Info, Download, Upload, Sparkles } from 'lucide-react';

// Custom toast styles
const toastStyles = {
    style: {
        background: 'rgba(15, 23, 42, 0.95)',
        color: '#f1f5f9',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
        padding: '16px 20px',
        fontSize: '0.95rem',
    },
};

// Toast provider component
export function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            gutter={12}
            containerStyle={{
                top: 100,
            }}
            toastOptions={{
                duration: 4000,
                ...toastStyles,
                success: {
                    ...toastStyles,
                    iconTheme: {
                        primary: '#22c55e',
                        secondary: '#f1f5f9',
                    },
                },
                error: {
                    ...toastStyles,
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: '#f1f5f9',
                    },
                },
            }}
        />
    );
}

// Custom toast functions
export const showToast = {
    success: (message: string) => {
        toast.custom((t) => (
            <div
                className={`toast-custom ${t.visible ? 'toast-enter' : 'toast-exit'}`}
                style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95))',
                    border: '1px solid rgba(34, 197, 94, 0.4)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 20px 60px rgba(34, 197, 94, 0.2)',
                    backdropFilter: 'blur(10px)',
                    animation: t.visible ? 'slideIn 0.3s ease' : 'slideOut 0.3s ease',
                }}
            >
                <div style={{
                    background: 'rgba(34, 197, 94, 0.2)',
                    borderRadius: '50%',
                    padding: '8px',
                    display: 'flex',
                }}>
                    <CheckCircle size={24} color="#22c55e" />
                </div>
                <span style={{ color: '#f1f5f9', fontWeight: 500 }}>{message}</span>
            </div>
        ), { duration: 4000 });
    },

    error: (message: string) => {
        toast.custom((t) => (
            <div
                className={`toast-custom ${t.visible ? 'toast-enter' : 'toast-exit'}`}
                style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95))',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 20px 60px rgba(239, 68, 68, 0.2)',
                    backdropFilter: 'blur(10px)',
                    animation: t.visible ? 'slideIn 0.3s ease' : 'slideOut 0.3s ease',
                }}
            >
                <div style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    borderRadius: '50%',
                    padding: '8px',
                    display: 'flex',
                }}>
                    <XCircle size={24} color="#ef4444" />
                </div>
                <span style={{ color: '#f1f5f9', fontWeight: 500 }}>{message}</span>
            </div>
        ), { duration: 5000 });
    },

    warning: (message: string) => {
        toast.custom((t) => (
            <div
                style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95))',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 20px 60px rgba(245, 158, 11, 0.2)',
                    backdropFilter: 'blur(10px)',
                    animation: t.visible ? 'slideIn 0.3s ease' : 'slideOut 0.3s ease',
                }}
            >
                <div style={{
                    background: 'rgba(245, 158, 11, 0.2)',
                    borderRadius: '50%',
                    padding: '8px',
                    display: 'flex',
                }}>
                    <AlertTriangle size={24} color="#f59e0b" />
                </div>
                <span style={{ color: '#f1f5f9', fontWeight: 500 }}>{message}</span>
            </div>
        ), { duration: 4000 });
    },

    info: (message: string) => {
        toast.custom((t) => (
            <div
                style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95))',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 20px 60px rgba(99, 102, 241, 0.2)',
                    backdropFilter: 'blur(10px)',
                    animation: t.visible ? 'slideIn 0.3s ease' : 'slideOut 0.3s ease',
                }}
            >
                <div style={{
                    background: 'rgba(99, 102, 241, 0.2)',
                    borderRadius: '50%',
                    padding: '8px',
                    display: 'flex',
                }}>
                    <Info size={24} color="#6366f1" />
                </div>
                <span style={{ color: '#f1f5f9', fontWeight: 500 }}>{message}</span>
            </div>
        ), { duration: 4000 });
    },

    upload: (message: string) => {
        toast.custom((t) => (
            <div
                style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95))',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 20px 60px rgba(99, 102, 241, 0.2)',
                    backdropFilter: 'blur(10px)',
                    animation: t.visible ? 'slideIn 0.3s ease' : 'slideOut 0.3s ease',
                }}
            >
                <div style={{
                    background: 'rgba(99, 102, 241, 0.2)',
                    borderRadius: '50%',
                    padding: '8px',
                    display: 'flex',
                }}>
                    <Upload size={24} color="#6366f1" />
                </div>
                <span style={{ color: '#f1f5f9', fontWeight: 500 }}>{message}</span>
            </div>
        ), { duration: 3000 });
    },

    download: (message: string) => {
        toast.custom((t) => (
            <div
                style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95))',
                    border: '1px solid rgba(34, 197, 94, 0.4)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 20px 60px rgba(34, 197, 94, 0.2)',
                    backdropFilter: 'blur(10px)',
                    animation: t.visible ? 'slideIn 0.3s ease' : 'slideOut 0.3s ease',
                }}
            >
                <div style={{
                    background: 'rgba(34, 197, 94, 0.2)',
                    borderRadius: '50%',
                    padding: '8px',
                    display: 'flex',
                }}>
                    <Download size={24} color="#22c55e" />
                </div>
                <span style={{ color: '#f1f5f9', fontWeight: 500 }}>{message}</span>
            </div>
        ), { duration: 4000 });
    },

    analysisComplete: (isAI: boolean, confidence: number) => {
        const color = isAI ? '#ef4444' : '#22c55e';
        const bgColor = isAI ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)';
        const borderColor = isAI ? 'rgba(239, 68, 68, 0.4)' : 'rgba(34, 197, 94, 0.4)';
        const message = isAI
            ? `AI Generated Detected (${(confidence * 100).toFixed(0)}% confidence)`
            : `Likely Real Image (${((1 - confidence) * 100).toFixed(0)}% confidence)`;

        toast.custom((t) => (
            <div
                style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95))',
                    border: `2px solid ${borderColor}`,
                    borderRadius: '16px',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    boxShadow: `0 20px 60px ${bgColor}`,
                    backdropFilter: 'blur(10px)',
                    animation: t.visible ? 'slideIn 0.3s ease' : 'slideOut 0.3s ease',
                    minWidth: '350px',
                }}
            >
                <div style={{
                    background: bgColor,
                    borderRadius: '50%',
                    padding: '12px',
                    display: 'flex',
                }}>
                    <Sparkles size={28} color={color} />
                </div>
                <div>
                    <p style={{
                        color: '#f1f5f9',
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        marginBottom: '4px'
                    }}>
                        Analysis Complete!
                    </p>
                    <p style={{
                        color: color,
                        fontWeight: 500,
                        fontSize: '0.95rem'
                    }}>
                        {message}
                    </p>
                </div>
            </div>
        ), { duration: 6000 });
    },
};

// Add global styles for toast animations
if (typeof window !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
    document.head.appendChild(style);
}
