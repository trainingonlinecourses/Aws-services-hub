import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AWS Services Hub",
  description: "Explore AWS services, project templates, and infrastructure generation tools in one place.",
  keywords: ["AWS", "Next.js", "TypeScript", "Tailwind CSS", "cloud infrastructure", "Terraform", "React"],
  authors: [{ name: "AWS Services Hub" }],
  openGraph: {
    title: "AWS Services Hub",
    description: "Explore AWS services, project templates, and infrastructure generation tools.",
    siteName: "AWS Services Hub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AWS Services Hub",
    description: "Explore AWS services, project templates, and infrastructure generation tools.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
