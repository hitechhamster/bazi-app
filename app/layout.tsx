import type { Metadata } from "next";
import NextTopLoader from 'nextjs-toploader';
import "./globals.css";

export const metadata: Metadata = {
  title: "Bazi Master",
  description: "Your personalised Eight Characters destiny reading",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=Noto+Serif+TC:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="zen-paper-bg min-h-full flex flex-col">
        <NextTopLoader
          color="#BC2D2D"
          height={2}
          showSpinner={false}
          shadow={false}
          crawl={true}
          speed={300}
          easing="ease"
        />
        {children}
      </body>
    </html>
  );
}
