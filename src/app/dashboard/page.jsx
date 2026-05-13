"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

import {
  Sparkles,
  ListChecks,
  Info,
  ShieldCheck,
  Zap,
  Users,
  BarChart3,
  UserPlus,
  Inbox,
  ClipboardList,
  History,
  MessageSquare,
  Database,
  ArrowUpRight,
  CheckCircle2,
  LockKeyhole,
  Activity,
} from "lucide-react";

function ActivityMascot({ variant = 0 }) {
  return (
    <div className={`mascot mascot-${variant % 4}`} aria-hidden="true">
      <div className="mascot-wire mascot-wire-left" />
      <div className="mascot-wire mascot-wire-right" />
      <div className="mascot-body">
        <span className="mascot-eye mascot-eye-left" />
        <span className="mascot-eye mascot-eye-right" />
        <span className="mascot-smile" />
      </div>
      <div className="mascot-leg mascot-leg-left" />
      <div className="mascot-leg mascot-leg-right" />
      <div className="mascot-ball" />
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();

  if (!session || !session.user) {
    return (
      <>
        <style>{loadingStyles}</style>
        <div className="loading-root">
          <div className="loading-card">
            <div className="loading-mark">
              <span />
              <span />
              <span />
            </div>
            <p className="loading-title">Onda Care</p>
            <p className="loading-copy">Memuat data pengguna...</p>
          </div>
        </div>
      </>
    );
  }

  const user = session.user;
  const role = user.role;

  const isAdmin = role === "Administrator";
  const isSalesAgen = ["Salesman", "Agen"].includes(role);
  const isPIC = ["PIC OMI", "PIC OMI (SS)", "Acting PIC"].includes(role);
  const isManagerPlus = [
    "Sales Manager",
    "Acting Manager",
    "User Feedback",
    "Viewer",
  ].includes(role);

  const getMenuCards = () => {
    if (isAdmin) {
      return [
        {
          href: "/dashboard/admin/users",
          title: "User Management",
          desc: "Kelola akses, role, dan akun karyawan",
          icon: Users,
          color: "#533E64",
          bg: "#E7E1F4",
          border: "#D8CCE8",
          label: "Admin desk",
        },
        {
          href: "/dashboard/admin/analytics",
          title: "Data Warehouse",
          desc: "Monitoring data BigQuery real-time",
          icon: BarChart3,
          color: "#070607",
          bg: "#D8D441",
          border: "#C7C235",
          label: "Live data",
        },
      ];
    }

    if (isSalesAgen) {
      return [
        {
          href: "/dashboard/submit",
          title: "Isi Formulir",
          desc: "Laporan barang & kendala toko",
          icon: Sparkles,
          color: "#533E64",
          bg: "#C9D1FF",
          border: "#AEB9F2",
          label: "Start report",
        },
        {
          href: "/dashboard/my-tickets",
          title: "Status Laporan",
          desc: "Pantau progres secara real-time",
          icon: ListChecks,
          color: "#070607",
          bg: "#D8D441",
          border: "#C7C235",
          label: "Track work",
        },
      ];
    }

    if (isPIC) {
      return [
        {
          href: "/dashboard/queue",
          title: "Antrian Triase",
          desc: "Tindak lanjuti laporan lapangan",
          icon: ClipboardList,
          color: "#070607",
          bg: "#F3C7D7",
          border: "#E8AFC3",
          label: "Action queue",
        },
        {
          href: "/dashboard/history",
          title: "Riwayat Saya",
          desc: "Aksi penanganan yang selesai",
          icon: History,
          color: "#533E64",
          bg: "#C9D1FF",
          border: "#AEB9F2",
          label: "Done list",
        },
      ];
    }

    if (isManagerPlus) {
      return [
        {
          href: "/dashboard/queue",
          title: "Antrian Tugas",
          desc: "Kelola tugas antrian divisi",
          icon: Inbox,
          color: "#533E64",
          bg: "#C9D1FF",
          border: "#AEB9F2",
          label: "Team queue",
        },
        {
          href: "/dashboard/history",
          title: "Riwayat Penanganan",
          desc: "Tinjau performa tugas selesai",
          icon: History,
          color: "#070607",
          bg: "#D8D441",
          border: "#C7C235",
          label: "Performance",
        },
        {
          href: "/dashboard/feedback",
          title: "Analisis Feedback",
          desc: "Evaluasi kualitas layanan",
          icon: MessageSquare,
          color: "#070607",
          bg: "#F3C7D7",
          border: "#E8AFC3",
          label: "Voice check",
        },
      ];
    }
    return [];
  };

  const menuCards = getMenuCards();
  const firstName = user.name?.split(" ")[0] || "User";

  const heroCopy = isAdmin
    ? {
        eyebrow: "System playground",
        lineOne: "Kelola rapi.",
        lineTwo: "Kontrol aman.",
        lineThree: "Gerak cepat.",
        desc: "Pusat kontrol akun, akses, dan data operasional Onda Care dalam satu halaman yang tidak terlihat seperti spreadsheet pensiun.",
      }
    : isSalesAgen
      ? {
          eyebrow: "Field playground",
          lineOne: "Lapor cepat.",
          lineTwo: "Pantau jelas.",
          lineThree: "Toko aman.",
          desc: "Buat laporan lapangan dan ikuti statusnya tanpa perlu berburu kabar dari chat yang tenggelam entah di mana.",
        }
      : isPIC
        ? {
            eyebrow: "Triage playground",
            lineOne: "Ambil antrian.",
            lineTwo: "Beresi tugas.",
            lineThree: "Tutup rapi.",
            desc: "Antrian masuk, prioritas jelas, dan riwayat kerja tertata supaya operasional tidak jadi tebak-tebakan kolektif.",
          }
        : isManagerPlus
          ? {
              eyebrow: "Manager playground",
              lineOne: "Lihat tren.",
              lineTwo: "Atur beban.",
              lineThree: "Jaga mutu.",
              desc: "Pantau antrian, riwayat, dan feedback agar keputusan tim tidak bergantung pada firasat dan kopi sachet.",
            }
          : {
              eyebrow: "Onda playground",
              lineOne: "Akses siap.",
              lineTwo: "Modul menunggu.",
              lineThree: "Tetap tenang.",
              desc: "Role Anda belum memiliki modul khusus pada dashboard ini. Sistem tetap mengenali sesi Anda.",
            };

  const tipsText = isSalesAgen
    ? "Gunakan koneksi internet stabil saat mengirim laporan agar data sinkron sempurna. Teknologi memang canggih, sampai bertemu sinyal dua bar."
    : isPIC
      ? "Prioritaskan antrian dengan label Urgent untuk menjaga kualitas layanan dan mengurangi drama operasional yang sebenarnya bisa dicegah."
      : isManagerPlus
        ? "Tinjau tren feedback mingguan untuk bahan meeting evaluasi divisi, bukan cuma mengandalkan suasana ruangan."
        : "Semua akses aktif dan terenkripsi. Silakan lanjutkan pekerjaan tanpa membuat sistem ini ikut menghela napas.";

  const PrimaryIcon = isAdmin ? ShieldCheck : Zap;

  return (
    <>
      <style>{styles}</style>
      <div className="playground-root">
        <div className="playground-shell">
          <div className="shape shape-lime" />
          <div className="shape shape-lavender" />
          <div className="shape shape-rose" />


          <main className="hero-layout">
            <section className="hero-copy" aria-labelledby="dashboard-title">
              <div className="eyebrow">
                <PrimaryIcon size={14} />
                <span>{heroCopy.eyebrow}</span>
              </div>

              <h1 id="dashboard-title" className="hero-title">
                <span>Halo, {firstName}.</span>
                <span>{heroCopy.lineOne}</span>
                <span>{heroCopy.lineTwo}</span>
                <span>{heroCopy.lineThree}</span>
              </h1>

              <p className="hero-desc">{heroCopy.desc}</p>

              <div className="hero-actions">
                {menuCards[0] ? (
                  <Link href={menuCards[0].href} className="primary-cta">
                    Buka modul utama
                    <ArrowUpRight size={15} />
                  </Link>
                ) : (
                  <span className="primary-cta primary-cta-disabled">
                    Modul belum tersedia
                  </span>
                )}

                <div className="profile-token" title={user.name || "User"}>
                  <span className="profile-avatar">{firstName.charAt(0)}</span>
                  <span>
                    <strong>{user.name}</strong>
                    <small>{role || "User"}</small>
                  </span>
                </div>
              </div>
            </section>

            <section className="activity-panel" aria-label="Menu dashboard">
              {menuCards.length > 0 ? (
                menuCards.map((card, i) => {
                  const Icon = card.icon;

                  return (
                    <Link
                      href={card.href}
                      key={card.href}
                      className="activity-card"
                      style={{
                        "--card-bg": card.bg,
                        "--card-border": card.border,
                        "--card-ink": card.color,
                        "--card-delay": `${i * 90}ms`,
                      }}
                    >
                      <div className="activity-card-head">
                        <div className="activity-label">
                          <Icon size={13} />
                          {card.label}
                        </div>
                        <span className="activity-arrow">
                          <ArrowUpRight size={15} />
                        </span>
                      </div>

                      <div className="activity-copy">
                        <h2>{card.title}</h2>
                        <p>{card.desc}</p>
                      </div>

                      <div className="activity-art">
                        <div className="playground-line playground-line-left" />
                        <ActivityMascot variant={i} />
                        <div className="playground-line playground-line-right" />
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="activity-card empty-card">
                  <div className="activity-card-head">
                    <div className="activity-label">
                      <LockKeyhole size={13} />
                      No module
                    </div>
                  </div>
                  <div className="activity-copy">
                    <h2>Role belum punya menu</h2>
                    <p>Hubungi administrator untuk validasi akses dashboard.</p>
                  </div>
                  <div className="activity-art">
                    <ActivityMascot variant={3} />
                  </div>
                </div>
              )}
            </section>
          </main>

          <section className="utility-grid" aria-label="Ringkasan sesi">
            <div className="utility-card status-card">
              <div className="utility-icon utility-icon-green">
                <Activity size={18} />
              </div>
              <div>
                <p className="utility-kicker">Live monitor</p>
                <h3>Status Sesi</h3>
                <p className="utility-desc">
                  {user.name} terotentikasi sebagai {role || "User"}.
                </p>
              </div>
              <span className="status-badge">
                <CheckCircle2 size={12} />
                Aktif
              </span>
            </div>

            {isAdmin ? (
              <Link href="/dashboard/admin/users" className="utility-card admin-card">
                <div className="admin-card-pattern" />
                <div className="utility-icon admin-icon">
                  <UserPlus size={18} />
                </div>
                <div>
                  <p className="utility-kicker">Admin shortcut</p>
                  <h3>Pintasan Admin</h3>
                  <p className="utility-desc">
                    Registrasi personel baru, audit role, dan rapikan akses.
                  </p>
                </div>
                <span className="card-link-icon">
                  <ArrowUpRight size={15} />
                </span>
              </Link>
            ) : (
              <div className="utility-card tips-card">
                <div className="utility-icon utility-icon-blue">
                  <Info size={18} />
                </div>
                <div>
                  <p className="utility-kicker">Tiny reminder</p>
                  <h3>Tips Operasional</h3>
                  <p className="utility-desc">{tipsText}</p>
                </div>
              </div>
            )}

            <div className="utility-card engine-card">
              <div className="utility-icon utility-icon-purple">
                <Database size={18} />
              </div>
              <div>
                <p className="utility-kicker">Onda Cloud Engine v2.4</p>
                <h3>Data Tersinkron</h3>
                <p className="utility-desc">
                  Data terenkripsi dan tersinkronisasi otomatis dengan infrastruktur BigQuery PT. Onda Mega Integra.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

const loadingStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&family=DM+Sans:wght@400;500;700&display=swap');

  .loading-root {
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: #E9E9E9;
    font-family: 'DM Sans', sans-serif;
  }

  .loading-card {
    width: min(92vw, 360px);
    padding: 32px;
    border-radius: 34px;
    background: #FDFCFC;
    border: 1px solid rgba(7, 6, 7, 0.08);
    box-shadow: 0 24px 80px rgba(7, 6, 7, 0.08);
    text-align: center;
  }

  .loading-mark {
    height: 76px;
    display: inline-flex;
    align-items: flex-end;
    gap: 8px;
    margin-bottom: 16px;
  }

  .loading-mark span {
    width: 18px;
    border-radius: 999px 999px 12px 12px;
    background: #070607;
    animation: loadingBounce 0.75s ease-in-out infinite alternate;
  }

  .loading-mark span:nth-child(1) { height: 38px; background: #8F9FE9; }
  .loading-mark span:nth-child(2) { height: 58px; background: #D8D441; animation-delay: 0.12s; }
  .loading-mark span:nth-child(3) { height: 44px; background: #D75067; animation-delay: 0.24s; }

  .loading-title {
    margin: 0;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.04em;
    color: #070607;
  }

  .loading-copy {
    margin: 6px 0 0;
    font-size: 13px;
    color: #777277;
  }

  @keyframes loadingBounce {
    to { transform: translateY(-12px); }
  }
`;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=DM+Sans:wght@400;500;700&display=swap');

  * { box-sizing: border-box; }

  .playground-root {
    width: 100%;
    min-height: 100vh;
    padding: clamp(12px, 2vw, 28px);
    background:
      radial-gradient(circle at top left, rgba(143, 159, 233, 0.28), transparent 34%),
      radial-gradient(circle at bottom right, rgba(216, 212, 65, 0.24), transparent 30%),
      #E9E9E9;
    color: #070607;
    font-family: 'DM Sans', sans-serif;
  }

  .playground-shell {
    position: relative;
    width: min(1440px, 100%);
    min-height: calc(100vh - clamp(24px, 4vw, 56px));
    margin: 0 auto;
    overflow: hidden;
    border-radius: clamp(26px, 4vw, 46px);
    background: #FDFCFC;
    border: 1px solid rgba(7, 6, 7, 0.08);
    box-shadow: 0 30px 100px rgba(7, 6, 7, 0.12);
  }

  .shape {
    position: absolute;
    z-index: 0;
    pointer-events: none;
    filter: blur(0.2px);
  }

  .shape-lime {
    top: 78px;
    right: 38%;
    width: 18px;
    height: 18px;
    background: #D8D441;
    transform: rotate(12deg);
  }

  .shape-lavender {
    bottom: 90px;
    left: 6%;
    width: 28px;
    height: 28px;
    border-radius: 999px;
    background: #8F9FE9;
  }

  .shape-rose {
    top: 43%;
    left: 45%;
    width: 16px;
    height: 16px;
    border-radius: 6px;
    background: #D75067;
    transform: rotate(18deg);
  }

  .topbar {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: clamp(18px, 2.4vw, 32px) clamp(20px, 4vw, 56px) 0;
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-width: max-content;
    color: #070607;
    text-decoration: none;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 15px;
    font-weight: 800;
    letter-spacing: -0.03em;
  }

  .brand-symbol {
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    border-radius: 999px;
    background: #070607;
    color: #FDFCFC;
    font-size: 15px;
    font-weight: 800;
  }

  .topnav {
    display: flex;
    align-items: center;
    gap: clamp(12px, 2vw, 28px);
    padding: 10px 14px;
    border-radius: 999px;
    background: rgba(233, 233, 233, 0.45);
    border: 1px solid rgba(7, 6, 7, 0.06);
  }

  .topnav span {
    font-size: 12px;
    font-weight: 700;
    color: #4E4A4E;
  }

  .session-pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 10px 14px;
    border-radius: 999px;
    background: #070607;
    color: #FDFCFC;
    font-size: 12px;
    font-weight: 800;
    box-shadow: 0 12px 30px rgba(7, 6, 7, 0.16);
  }

  .hero-layout {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 0.86fr) minmax(0, 1.14fr);
    gap: clamp(28px, 5vw, 72px);
    align-items: center;
    padding: clamp(36px, 7vw, 92px) clamp(20px, 4vw, 56px) clamp(30px, 5vw, 64px);
  }

  .hero-copy {
    max-width: 520px;
  }

  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 18px;
    padding: 8px 12px;
    border-radius: 999px;
    background: #E9E9E9;
    color: #533E64;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .hero-title {
    margin: 0;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: clamp(42px, 6vw, 86px);
    line-height: 0.94;
    letter-spacing: -0.075em;
    font-weight: 800;
    color: #070607;
  }

  .hero-title span {
    display: block;
  }

  .hero-desc {
    width: min(100%, 420px);
    margin: 24px 0 0;
    color: #514E51;
    font-size: clamp(14px, 1.4vw, 16px);
    line-height: 1.7;
  }

  .hero-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 30px;
  }

  .primary-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 48px;
    padding: 0 20px;
    border-radius: 16px;
    background: #070607;
    color: #FDFCFC;
    text-decoration: none;
    font-size: 13px;
    font-weight: 800;
    box-shadow: 0 14px 28px rgba(7, 6, 7, 0.18);
    transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease;
  }

  .primary-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 34px rgba(7, 6, 7, 0.22);
    background: #1C1A1C;
  }

  .primary-cta-disabled {
    opacity: 0.62;
    box-shadow: none;
  }

  .profile-token {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 48px;
    max-width: min(100%, 320px);
    padding: 6px 14px 6px 6px;
    border: 1px solid rgba(7, 6, 7, 0.09);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.76);
  }

  .profile-avatar {
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border-radius: 12px;
    background: #8F9FE9;
    color: #070607;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    text-transform: uppercase;
  }

  .profile-token strong,
  .profile-token small {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .profile-token strong {
    max-width: 210px;
    font-size: 12px;
    color: #070607;
  }

  .profile-token small {
    max-width: 210px;
    margin-top: 1px;
    font-size: 11px;
    color: #777277;
  }

  .activity-panel {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(14px, 2vw, 22px);
    align-items: stretch;
  }

  .activity-panel .activity-card:nth-child(3) {
    grid-column: span 2;
    min-height: 310px;
  }

  .activity-card {
    position: relative;
    isolation: isolate;
    display: flex;
    min-height: clamp(330px, 35vw, 430px);
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    padding: clamp(18px, 2vw, 26px);
    border-radius: clamp(26px, 3vw, 34px);
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    color: #070607;
    text-decoration: none;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.38), 0 18px 40px rgba(7, 6, 7, 0.07);
    animation: cardRise 500ms var(--card-delay) ease both;
    transition: transform 200ms ease, box-shadow 200ms ease, filter 200ms ease;
  }

  .activity-card::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    opacity: 0.22;
    background:
      linear-gradient(rgba(255,255,255,0.55) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.55) 1px, transparent 1px);
    background-size: 34px 34px;
    mask-image: linear-gradient(to bottom, transparent, black 26%, black 82%, transparent);
  }

  .activity-card:hover {
    transform: translateY(-8px) rotate(-0.4deg);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.48), 0 30px 70px rgba(7, 6, 7, 0.13);
    filter: saturate(1.05);
  }

  .activity-card:hover .activity-arrow {
    transform: translate(4px, -4px);
    background: #070607;
    color: #FDFCFC;
  }

  .activity-card:hover .mascot-body {
    transform: translateX(-50%) translateY(-6px) rotate(3deg);
  }

  .activity-card:hover .mascot-1 .mascot-body {
    transform: translateX(-50%) translateY(-6px) rotate(48deg);
  }

  .activity-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .activity-label {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 10px;
    border-radius: 999px;
    background: rgba(253, 252, 252, 0.48);
    border: 1px solid rgba(7, 6, 7, 0.07);
    color: var(--card-ink);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: -0.01em;
    backdrop-filter: blur(8px);
  }

  .activity-arrow,
  .card-link-icon {
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border-radius: 999px;
    background: rgba(253, 252, 252, 0.62);
    color: #070607;
    border: 1px solid rgba(7, 6, 7, 0.08);
    transition: transform 180ms ease, background 180ms ease, color 180ms ease;
  }

  .activity-copy {
    position: relative;
    z-index: 2;
    margin-top: 22px;
  }

  .activity-copy h2 {
    max-width: 320px;
    margin: 0;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: clamp(28px, 3.1vw, 43px);
    line-height: 0.98;
    letter-spacing: -0.065em;
    font-weight: 800;
    color: #070607;
  }

  .activity-copy p {
    max-width: 260px;
    margin: 14px 0 0;
    color: rgba(7, 6, 7, 0.63);
    font-size: 13px;
    line-height: 1.55;
  }

  .activity-art {
    position: relative;
    display: grid;
    place-items: center;
    min-height: 166px;
    margin: 18px -8px -4px;
    border-radius: 28px;
    background: rgba(253, 252, 252, 0.35);
    border: 1px solid rgba(7, 6, 7, 0.06);
    overflow: hidden;
  }

  .playground-line {
    position: absolute;
    width: 16px;
    height: 74px;
    bottom: 42px;
    border: 3px solid rgba(7, 6, 7, 0.6);
    border-top: none;
    border-bottom: none;
  }

  .playground-line::before,
  .playground-line::after {
    content: '';
    position: absolute;
    left: -11px;
    width: 32px;
    height: 3px;
    border-radius: 999px;
    background: rgba(7, 6, 7, 0.6);
  }

  .playground-line::before { top: 0; }
  .playground-line::after { bottom: 0; }

  .playground-line-left { left: 18%; }
  .playground-line-right { right: 18%; }

  .mascot {
    position: relative;
    width: 144px;
    height: 126px;
  }

  .mascot-body {
    position: absolute;
    left: 50%;
    top: 20px;
    width: 96px;
    height: 84px;
    transform: translateX(-50%);
    border: 3px solid rgba(7, 6, 7, 0.72);
    background: #D75067;
    transition: transform 220ms ease;
  }

  .mascot-0 .mascot-body {
    border-radius: 48% 52% 44% 56% / 42% 46% 54% 58%;
    background: #D75067;
  }

  .mascot-1 .mascot-body {
    border-radius: 34px 48px 30px 54px;
    background: #F09A54;
    transform: translateX(-50%) rotate(45deg);
  }

  .mascot-2 .mascot-body {
    border-radius: 44% 56% 56% 44% / 58% 44% 56% 42%;
    background: #8F9FE9;
  }

  .mascot-3 .mascot-body {
    border-radius: 34px 54px 34px 54px;
    background: #D8D441;
  }

  .mascot-eye {
    position: absolute;
    top: 32px;
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: #070607;
  }

  .mascot-eye-left { left: 29px; }
  .mascot-eye-right { right: 29px; }

  .mascot-smile {
    position: absolute;
    left: 50%;
    top: 46px;
    width: 28px;
    height: 14px;
    border-bottom: 3px solid #070607;
    border-radius: 0 0 999px 999px;
    transform: translateX(-50%);
  }

  .mascot-wire {
    position: absolute;
    top: 48px;
    width: 42px;
    height: 3px;
    background: rgba(7, 6, 7, 0.72);
  }

  .mascot-wire-left {
    left: 0;
    transform: rotate(-20deg);
  }

  .mascot-wire-right {
    right: 0;
    transform: rotate(20deg);
  }

  .mascot-leg {
    position: absolute;
    bottom: 10px;
    width: 32px;
    height: 3px;
    background: rgba(7, 6, 7, 0.72);
  }

  .mascot-leg-left {
    left: 38px;
    transform: rotate(-28deg);
  }

  .mascot-leg-right {
    right: 38px;
    transform: rotate(28deg);
  }

  .mascot-ball {
    position: absolute;
    right: 6px;
    bottom: 18px;
    width: 34px;
    height: 34px;
    border: 3px solid rgba(7, 6, 7, 0.72);
    border-radius: 999px;
    background:
      linear-gradient(90deg, transparent 46%, rgba(7,6,7,0.72) 47%, rgba(7,6,7,0.72) 53%, transparent 54%),
      linear-gradient(0deg, transparent 46%, rgba(7,6,7,0.72) 47%, rgba(7,6,7,0.72) 53%, transparent 54%),
      rgba(253, 252, 252, 0.6);
  }

  .empty-card {
    --card-bg: #E9E9E9;
    --card-border: #D9D9D9;
    --card-ink: #533E64;
    grid-column: span 2;
  }

  .utility-grid {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 1.05fr 1fr 1.1fr;
    gap: 16px;
    padding: 0 clamp(20px, 4vw, 56px) clamp(20px, 4vw, 56px);
  }

  .utility-card {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 16px;
    min-height: 150px;
    padding: 22px;
    border-radius: 28px;
    background: #F8F7F5;
    border: 1px solid rgba(7, 6, 7, 0.08);
    color: #070607;
    text-decoration: none;
    overflow: hidden;
  }

  .utility-card h3 {
    margin: 4px 0 8px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 21px;
    line-height: 1;
    letter-spacing: -0.045em;
    font-weight: 800;
  }

  .utility-kicker {
    margin: 0;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: #777277;
  }

  .utility-desc {
    margin: 0;
    color: #5C585C;
    font-size: 13px;
    line-height: 1.62;
  }

  .utility-icon {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border-radius: 15px;
    border: 1px solid rgba(7, 6, 7, 0.08);
    color: #070607;
  }

  .utility-icon-green { background: #D8D441; }
  .utility-icon-blue { background: #C9D1FF; }
  .utility-icon-purple { background: #E7E1F4; }

  .status-badge {
    position: absolute;
    right: 18px;
    top: 18px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 10px;
    border-radius: 999px;
    background: #FDFCFC;
    border: 1px solid rgba(7, 6, 7, 0.08);
    color: #2F7D43;
    font-size: 11px;
    font-weight: 800;
  }

  .admin-card {
    background: #070607;
    color: #FDFCFC;
    transition: transform 180ms ease, box-shadow 180ms ease;
  }

  .admin-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 24px 60px rgba(7, 6, 7, 0.22);
  }

  .admin-card .utility-kicker,
  .admin-card .utility-desc {
    color: rgba(253, 252, 252, 0.66);
  }

  .admin-icon {
    background: #D75067;
    color: #FDFCFC;
    border-color: rgba(255, 255, 255, 0.16);
  }

  .admin-card-pattern {
    position: absolute;
    inset: 0;
    opacity: 0.14;
    background:
      radial-gradient(circle at 12% 24%, #8F9FE9 0 10px, transparent 11px),
      radial-gradient(circle at 82% 18%, #D8D441 0 7px, transparent 8px),
      radial-gradient(circle at 70% 82%, #D75067 0 12px, transparent 13px);
  }

  .admin-card > *:not(.admin-card-pattern) {
    position: relative;
    z-index: 1;
  }

  .admin-card .card-link-icon {
    position: absolute;
    right: 18px;
    top: 18px;
    background: rgba(255, 255, 255, 0.1);
    color: #FDFCFC;
    border-color: rgba(255, 255, 255, 0.14);
  }

  .admin-card:hover .card-link-icon {
    transform: translate(4px, -4px);
  }

  .engine-card::after {
    content: '';
    position: absolute;
    right: -40px;
    bottom: -55px;
    width: 150px;
    height: 150px;
    border-radius: 44% 56% 40% 60%;
    background: #D75067;
    opacity: 0.13;
    transform: rotate(18deg);
  }

  @keyframes cardRise {
    from {
      opacity: 0;
      transform: translateY(24px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (max-width: 1120px) {
    .hero-layout {
      grid-template-columns: 1fr;
      align-items: start;
    }

    .hero-copy {
      max-width: 760px;
    }

    .activity-panel {
      grid-template-columns: repeat(2, minmax(260px, 1fr));
    }

    .utility-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 760px) {
    .playground-root {
      padding: 0;
    }

    .playground-shell {
      min-height: 100vh;
      border-radius: 0;
    }

    .topbar {
      align-items: flex-start;
      gap: 14px;
      flex-wrap: wrap;
      padding-top: 20px;
    }

    .topnav {
      order: 3;
      width: 100%;
      justify-content: space-between;
      border-radius: 18px;
    }

    .session-pill {
      margin-left: auto;
    }

    .hero-layout {
      padding-top: 38px;
    }

    .hero-title {
      font-size: clamp(42px, 15vw, 64px);
    }

    .hero-actions {
      align-items: stretch;
    }

    .primary-cta,
    .profile-token {
      width: 100%;
    }

    .profile-token strong,
    .profile-token small {
      max-width: calc(100vw - 140px);
    }

    .activity-panel {
      display: flex;
      gap: 14px;
      margin-inline: -20px;
      padding: 0 20px 10px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
    }

    .activity-panel::-webkit-scrollbar {
      display: none;
    }

    .activity-card,
    .activity-panel .activity-card:nth-child(3) {
      min-width: 82vw;
      min-height: 360px;
      grid-column: auto;
      scroll-snap-align: start;
    }

    .playground-line-left { left: 13%; }
    .playground-line-right { right: 13%; }

    .utility-card {
      min-height: auto;
      padding: 20px;
    }

    .status-badge {
      position: static;
      margin-left: auto;
    }
  }

  @media (max-width: 440px) {
    .topnav span {
      font-size: 11px;
    }

    .activity-copy h2 {
      font-size: 32px;
    }

    .activity-art {
      min-height: 150px;
    }
  }
`;
