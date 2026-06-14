import { AppProviders } from "@/providers";
import type { Metadata } from "next";
import { Bai_Jamjuree } from "next/font/google";
import Header from "@/components/Navbar";
import RouteMeta from "@/components/RouteMeta";
import Footer from "@/components/Footer";
import "./globals.css";

const baiJamjuree = Bai_Jamjuree({
  variable: "--font-bai-jamjuree",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
});

// ✅ Production Ready Metadata
export const metadata: Metadata = {
  metadataBase: new URL("https://your-domain.com"), // পরে live domain add করবা

  title: {
    default: "Course Selling Platform",
    template: "%s | Course Selling Platform",
  },

  description:
    "A modern course selling platform for buying, selling, and learning premium online courses.",

  keywords: [
    "Course Selling Platform",
    "Online Courses",
    "E-learning",
    "Learning Platform",
    "Programming Courses",
    "Web Development",
  ],

  authors: [
    {
      name: "Course Selling Platform Team",
    },
  ],

  creator: "Course Selling Platform",
  publisher: "Course Selling Platform",
  applicationName: "Course Selling Platform",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "Course Selling Platform",
    description:
      "A modern platform for buying and learning premium online courses.",
    url: "/",
    siteName: "Course Selling Platform",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png", // public folder এ রাখবা
        width: 1200,
        height: 630,
        alt: "Course Selling Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Course Selling Platform",
    description:
      "A modern platform for buying and learning premium online courses.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

import NextTopLoader from 'nextjs-toploader';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${baiJamjuree.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-full flex flex-col font-bai-jamjuree">
        <NextTopLoader
          color="#0052CC"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #0052CC,0 0 5px #0052CC"
        />
        <AppProviders>
          <Header />
          <RouteMeta />

          <main className="flex-1">{children}</main>

          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
