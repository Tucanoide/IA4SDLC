import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import { TopNavBar } from "@/components/layout/TopNavBar";
import { SideNavBar } from "@/components/layout/SideNavBar";
import { ChatBot } from "@/components/layout/ChatBot";
import { unstable_cache } from "next/cache";
import pool from "@/lib/db";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "The Vault | Mainframe Intelligence Platform",
  description: "Glassmorphic AI dashboard for COBOL legacy system analysis, dependency tracing and documentation generation.",
};

const getGlobalMetrics = unstable_cache(
  async () => {
    try {
      const result = await pool.query(`
        SELECT
           COUNT(*)::text AS total_programs,
           SUM(array_length(string_to_array(original_code, E'\n'), 1))::text AS total_lines
        FROM cobol_analysis.programs
        WHERE is_current = true AND original_code IS NOT NULL
      `);
      return {
        totalPrograms: parseInt(result.rows[0]?.total_programs ?? '0', 10),
        totalLines: parseInt(result.rows[0]?.total_lines ?? '0', 10),
        health: 80
      };
    } catch (e) {
      console.error("Failed to fetch global metrics", e);
      return null;
    }
  },
  ['global-metrics-cache'],
  { revalidate: 3600 }
);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const metrics = await getGlobalMetrics() || undefined;

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,700;0,900;1,700;1,900&family=IBM+Plex+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: `.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }` }} />
      </head>
      <body
        className={`${inter.variable} ${ibmPlexMono.variable} font-body text-on-surface selection:bg-primary/20 min-h-screen relative`}
      >
        <TopNavBar initialMetrics={metrics} />
        <div className="flex flex-1">
          <SideNavBar />
          <main className="ml-64 flex-1 min-h-screen pt-10 px-10 pb-24 flex flex-col gap-10 relative z-10">
            {children}
          </main>
        </div>
        <ChatBot />
      </body>
    </html>
  );
}
