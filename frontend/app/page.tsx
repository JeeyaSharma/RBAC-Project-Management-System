"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/dashboard");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="landing">
      {/* ---- Navbar ---- */}
      <nav className="landing-nav">
        <div className="landing-container landing-nav-inner">
          <Link href="/" className="landing-brand">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <span>SprintFlow</span>
          </Link>
          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <Link href="/login" className="landing-btn-ghost">Log In</Link>
            <Link href="/signup" className="landing-btn-primary">Get Started Free</Link>
          </div>
          <button className="landing-mobile-toggle" onClick={() => {
            document.querySelector('.landing-nav-links')?.classList.toggle('landing-nav-open');
          }} aria-label="Toggle menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </nav>

      {/* ---- Hero ---- */}
      <section className="hero">
        <div className="landing-container hero-inner">
          <div className="hero-content">
            <div className="hero-badge">🚀 Project management, simplified</div>
            <h1 className="hero-title">
              Ship faster with<br />
              <span className="hero-gradient">SprintFlow</span>
            </h1>
            <p className="hero-subtitle">
              Plan sprints, track tasks, and collaborate with your team — all in one
              intuitive workspace built for agile teams that move fast.
            </p>
            <div className="hero-actions">
              <Link href="/signup" className="landing-btn-primary landing-btn-lg">
                Start for Free
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </Link>
              <a href="#features" className="landing-btn-ghost landing-btn-lg">See Features</a>
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><strong>100%</strong><span>Free to use</span></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><strong>Agile</strong><span>Sprint-based</span></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><strong>Real-time</strong><span>Analytics</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-mockup">
              <div className="mockup-header">
                <span className="mockup-dot" />
                <span className="mockup-dot" />
                <span className="mockup-dot" />
              </div>
              <div className="mockup-body">
                <div className="mockup-sidebar">
                  <div className="mockup-sidebar-item active" />
                  <div className="mockup-sidebar-item" />
                  <div className="mockup-sidebar-item" />
                  <div className="mockup-sidebar-item" />
                </div>
                <div className="mockup-content">
                  <div className="mockup-stat-row">
                    <div className="mockup-stat blue" />
                    <div className="mockup-stat green" />
                    <div className="mockup-stat amber" />
                  </div>
                  <div className="mockup-kanban">
                    <div className="mockup-col">
                      <div className="mockup-col-header" />
                      <div className="mockup-card" />
                      <div className="mockup-card" />
                    </div>
                    <div className="mockup-col">
                      <div className="mockup-col-header" />
                      <div className="mockup-card accent" />
                    </div>
                    <div className="mockup-col">
                      <div className="mockup-col-header" />
                      <div className="mockup-card done" />
                      <div className="mockup-card done" />
                      <div className="mockup-card done" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Features ---- */}
      <section className="features-section" id="features">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-badge">Features</span>
            <h2 className="section-title">Everything your team needs</h2>
            <p className="section-desc">
              Powerful tools designed for modern agile workflows, from planning to delivery.
            </p>
          </div>
          <div className="features-grid">
            <FeatureCard
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                </svg>
              }
              title="Kanban Board"
              description="Visualize your workflow with drag-and-drop task boards. See what's in progress, blocked, or done at a glance."
              color="var(--primary)"
              bg="var(--primary-light)"
            />
            <FeatureCard
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" />
                </svg>
              }
              title="Sprint Management"
              description="Create, start, and complete sprints. Assign tasks, set goals, and track velocity across iterations."
              color="var(--purple)"
              bg="var(--purple-light)"
            />
            <FeatureCard
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
                </svg>
              }
              title="Real-time Analytics"
              description="Completion rates, story points, team performance — get actionable insights for every project and sprint."
              color="var(--success)"
              bg="var(--success-light)"
            />
            <FeatureCard
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
              title="Team Collaboration"
              description="Invite members, assign roles, and manage access. Owners, managers, developers, and viewers — all supported."
              color="var(--warning)"
              bg="var(--warning-light)"
            />
            <FeatureCard
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              }
              title="Multi-Project Support"
              description="Manage multiple projects with dedicated dashboards. Switch between projects effortlessly."
              color="var(--danger)"
              bg="var(--danger-light)"
            />
            <FeatureCard
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              }
              title="Role-Based Access"
              description="Fine-grained permissions ensure team members only see and do what they should. Security built in."
              color="#8b5cf6"
              bg="#ede9fe"
            />
          </div>
        </div>
      </section>

      {/* ---- How It Works ---- */}
      <section className="how-section" id="how-it-works">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-badge">How It Works</span>
            <h2 className="section-title">Up and running in minutes</h2>
            <p className="section-desc">
              Three simple steps to organize your team and start shipping.
            </p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Create a Project</h3>
              <p>Set up your project, invite your team members, and assign roles.</p>
            </div>
            <div className="step-connector" />
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Plan Your Sprints</h3>
              <p>Create sprints, break work into tasks, set story points and assignees.</p>
            </div>
            <div className="step-connector" />
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Track & Deliver</h3>
              <p>Move tasks across the board, monitor progress, and ship on time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="cta-section">
        <div className="landing-container cta-inner">
          <h2>Ready to streamline your workflow?</h2>
          <p>Join teams that use SprintFlow to plan, track, and deliver with confidence.</p>
          <Link href="/signup" className="landing-btn-primary landing-btn-lg">
            Get Started — It&apos;s Free
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </Link>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <div className="landing-footer-brand">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <span>SprintFlow</span>
          </div>
          <p className="landing-footer-copy">&copy; {new Date().getFullYear()} SprintFlow. Built for agile teams.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color, bg }: {
  icon: React.ReactNode; title: string; description: string; color: string; bg: string;
}) {
  return (
    <div className="feature-card">
      <div className="feature-icon" style={{ color, background: bg }}>{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{description}</p>
    </div>
  );
}
