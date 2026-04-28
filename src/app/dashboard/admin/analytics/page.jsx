'use client';

import { useState } from 'react';
import {
  ChartBarIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  ArrowsPointingOutIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const lookerStudioUrl = "https://lookerstudio.google.com/embed/reporting/0B5ff6cdq.../page/1M";

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

    .analytics-root {
      font-family: 'Plus Jakarta Sans', sans-serif;
      max-width: 1600px;
      margin: 0 auto;
      padding: 0 1.5rem 3rem;
    }

    .analytics-header {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 2.5rem 0 2rem;
      animation: fadeUp 0.5s ease both;
    }

    @media (min-width: 768px) {
      .analytics-header {
        flex-direction: row;
        align-items: flex-end;
        justify-content: space-between;
      }
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .header-left { display: flex; flex-direction: column; gap: 6px; }

    .header-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #2563eb;
      margin-bottom: 2px;
    }

    .header-eyebrow-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #2563eb;
    }

    .header-title {
      font-size: clamp(1.6rem, 3vw, 2.25rem);
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.03em;
      line-height: 1.15;
      margin: 0;
    }

    .header-desc {
      font-size: 13px;
      color: #94a3b8;
      margin: 4px 0 0;
      line-height: 1.65;
      max-width: 480px;
    }

    .header-desc-highlight {
      color: #2563eb;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    .update-info {
      display: none;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
    }

    @media (min-width: 640px) {
      .update-info { display: flex; }
    }

    .update-label {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #cbd5e1;
    }

    .update-value {
      font-family: 'DM Mono', monospace;
      font-size: 11px;
      color: #64748b;
    }

    .refresh-btn {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: #fff;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #64748b;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }

    .refresh-btn:hover {
      background: #eff6ff;
      border-color: #bfdbfe;
      color: #2563eb;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(37,99,235,0.12);
    }

    .refresh-btn svg {
      width: 17px;
      height: 17px;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
    .spin { animation: spin 0.8s linear infinite; }

    .status-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 10px;
      animation: fadeUp 0.5s 0.1s ease both;
      width: fit-content;
      margin-bottom: 1.25rem;
    }

    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #22c55e;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.75); }
    }

    .status-text {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #16a34a;
    }

    .status-sep {
      width: 1px;
      height: 12px;
      background: #bbf7d0;
    }

    .status-mono {
      font-family: 'DM Mono', monospace;
      font-size: 10px;
      color: #4ade80;
    }

    .iframe-shell {
      position: relative;
      border-radius: 24px;
      overflow: hidden;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      height: 75vh;
      min-height: 520px;
      animation: fadeUp 0.5s 0.15s ease both;
      box-shadow: 0 20px 60px -12px rgba(15,23,42,0.08), 0 0 0 1px rgba(0,0,0,0.03);
    }

    @media (min-width: 768px) {
      .iframe-shell { height: 80vh; }
    }

    .loading-screen {
      position: absolute;
      inset: 0;
      z-index: 20;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #f8fafc;
      gap: 0;
    }

    .loading-icon-wrap {
      position: relative;
      margin-bottom: 1.5rem;
    }

    .loading-ring {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      border: 3px solid #e2e8f0;
      border-top-color: #2563eb;
      animation: spin 0.75s linear infinite;
    }

    .loading-inner-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 24px;
      height: 24px;
      color: #93c5fd;
    }

    .loading-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0 0 6px;
    }

    .loading-desc {
      font-size: 12.5px;
      color: #94a3b8;
      text-align: center;
      max-width: 260px;
      line-height: 1.6;
      margin: 0;
    }

    .loading-bars {
      display: flex;
      align-items: flex-end;
      gap: 4px;
      margin-top: 1.5rem;
      height: 24px;
    }

    .loading-bar {
      width: 4px;
      border-radius: 2px;
      background: #bfdbfe;
      animation: barBounce 1.2s ease-in-out infinite;
    }

    .loading-bar:nth-child(1) { height: 12px; animation-delay: 0s; }
    .loading-bar:nth-child(2) { height: 20px; animation-delay: 0.1s; }
    .loading-bar:nth-child(3) { height: 16px; animation-delay: 0.2s; }
    .loading-bar:nth-child(4) { height: 24px; animation-delay: 0.3s; }
    .loading-bar:nth-child(5) { height: 14px; animation-delay: 0.4s; }

    @keyframes barBounce {
      0%, 100% { opacity: 0.3; transform: scaleY(0.6); }
      50% { opacity: 1; transform: scaleY(1); }
    }

    .corner-badge {
      position: absolute;
      top: 16px;
      right: 16px;
      z-index: 15;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 10px;
      background: rgba(255,255,255,0.9);
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      backdrop-filter: blur(8px);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #64748b;
    }

    .corner-badge-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #22c55e;
      animation: pulse 2s ease-in-out infinite;
    }

    .analytics-footer {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 1rem 0.25rem 0;
      animation: fadeUp 0.5s 0.2s ease both;
    }

    @media (min-width: 640px) {
      .analytics-footer {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }

    .footer-hint {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 11.5px;
      color: #94a3b8;
    }

    .footer-hint svg { width: 14px; height: 14px; flex-shrink: 0; }

    .footer-badges {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .footer-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .footer-badge-green {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #16a34a;
    }

    .footer-badge-blue {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
    }

    .footer-badge-green svg,
    .footer-badge-blue svg {
      width: 12px;
      height: 12px;
    }

    .badge-dot-green {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #22c55e;
      animation: pulse 2s ease-in-out infinite;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="analytics-root">
        <div className="analytics-header">
          <div className="header-left">
            <div className="header-eyebrow">
              <div className="header-eyebrow-dot" />
              Intelijen Bisnis
            </div>
            <h1 className="header-title">Dashboard Analitik</h1>
            <p className="header-desc">
              Visualisasi performa laporan secara real-time yang terintegrasi langsung dengan{' '}
              <span className="header-desc-highlight">
                <CircleStackIcon style={{ width: 13, height: 13 }} />
                BigQuery Data Warehouse
              </span>.
            </p>
          </div>

          <div className="header-right">
            <div className="update-info">
              <span className="update-label">Terakhir Diperbarui</span>
              <span className="update-value">Otomatis · Real-time</span>
            </div>
            <button
              className="refresh-btn"
              title="Refresh Laporan"
              onClick={() => { setIsLoading(true); window.location.reload(); }}
            >
              <ArrowPathIcon className={isLoading ? 'spin' : ''} />
            </button>
          </div>
        </div>

        <div className="status-bar">
          <div className="status-dot" />
          <span className="status-text">BigQuery Live</span>
          <div className="status-sep" />
          <span className="status-mono">Stream aktif</span>
        </div>

        <div className="iframe-shell">
          {!isLoading && (
            <div className="corner-badge">
              <div className="corner-badge-dot" />
              Live Data
            </div>
          )}

          {isLoading && (
            <div className="loading-screen">
              <div className="loading-icon-wrap">
                <div className="loading-ring" />
                <ChartBarIcon className="loading-inner-icon" />
              </div>
              <p className="loading-title">Mempersiapkan Laporan...</p>
              <p className="loading-desc">
                Sedang mengambil data dari BigQuery. Mohon tunggu sebentar.
              </p>
              <div className="loading-bars">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="loading-bar" />
                ))}
              </div>
            </div>
          )}

          <iframe
            src={lookerStudioUrl}
            frameBorder="0"
            style={{ border: 0 }}
            allowFullScreen
            onLoad={() => setIsLoading(false)}
            className="absolute top-0 left-0 w-full h-full z-10"
            title="Laporan Analisis Onda Care"
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          />
        </div>

        <div className="analytics-footer">
          <div className="footer-hint">
            <InformationCircleIcon />
            Gunakan kontrol di dalam laporan untuk memfilter data berdasarkan tanggal atau divisi.
          </div>

          <div className="footer-badges">
            <div className="footer-badge footer-badge-green">
              <div className="badge-dot-green" />
              BigQuery Live
            </div>
            <div className="footer-badge footer-badge-blue">
              <ArrowsPointingOutIcon style={{ width: 12, height: 12 }} />
              Full Screen
            </div>
          </div>
        </div>
      </div>
    </>
  );
}