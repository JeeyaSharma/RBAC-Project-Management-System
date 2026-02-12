import type { Metadata } from 'next'
import ThemeToggle from './theme-toggle'

export const metadata: Metadata = {
  title: 'RBAC - Role Based Access Control',
  description: 'Role based access control application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ margin: 0, padding: 0 }}>
        <ThemeToggle />
        {children}
        <style>{`
          :root {
            color-scheme: light;
            --section1-bg: #edeced;
            --section1-text: #0e0f10;
            --section2-bg: #000000;
            --section2-text: #ffffff;
            --section2-muted: #dddddd;
            --section3-bg: #006eef;
            --section3-text: #ffffff;
            --section4-bg: #feffff;
            --section4-text: #0e0f10;
            --section5-bg: #edeced;
            --section5-text: #0e0f10;
            --section6-bg: #006eef;
            --section6-text: #ffffff;
            --card-surface: #ffffff;
            --card-border: rgba(0, 0, 0, 0.12);
            --btn-text: #0e0f10;
            --btn-border: #0e0f10;
            --btn-hover-bg: #0e0f10;
            --btn-hover-text: #ffffff;
            --auth-bg: #006eef;
            --auth-card: rgba(255, 255, 255, 0.08);
            --auth-border: rgba(255, 255, 255, 0.2);
            --auth-input-border: #ffffff;
            --auth-input-bg: rgba(255, 255, 255, 0.1);
            --auth-text: #ffffff;
          }

          [data-theme='dark'] {
            color-scheme: dark;
            --section1-bg: #101217;
            --section1-text: #f6f6f2;
            --section2-bg: #0b0d12;
            --section2-text: #f6f6f2;
            --section2-muted: #c2c8d2;
            --section3-bg: #0b3b8f;
            --section3-text: #f6f6f2;
            --section4-bg: #141720;
            --section4-text: #f6f6f2;
            --section5-bg: #11141a;
            --section5-text: #f6f6f2;
            --section6-bg: #0b3b8f;
            --section6-text: #f6f6f2;
            --card-surface: #161a23;
            --card-border: rgba(255, 255, 255, 0.12);
            --btn-text: #f6f6f2;
            --btn-border: #f6f6f2;
            --btn-hover-bg: #f6f6f2;
            --btn-hover-text: #11141a;
            --auth-bg: #0b3b8f;
            --auth-card: rgba(15, 20, 32, 0.8);
            --auth-border: rgba(255, 255, 255, 0.15);
            --auth-input-border: rgba(255, 255, 255, 0.6);
            --auth-input-bg: rgba(255, 255, 255, 0.06);
            --auth-text: #f6f6f2;
          }

          .theme-toggle {
            position: fixed;
            right: 20px;
            top: 20px;
            z-index: 50;
            padding: 10px 14px;
            border-radius: 999px;
            border: 1px solid rgba(255, 255, 255, 0.35);
            background: rgba(10, 12, 18, 0.35);
            color: #ffffff;
            font-family: 'Helvetica, Arial, sans-serif';
            font-size: 0.9rem;
            cursor: pointer;
            backdrop-filter: blur(10px);
            transition: transform 200ms ease, box-shadow 200ms ease, background 200ms ease;
          }

          .theme-toggle:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
          }
        `}</style>
      </body>
    </html>
  )
}
