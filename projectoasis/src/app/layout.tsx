import type { Metadata } from "next"; //Test
import localFont from "next/font/local";
import '../app/globals.css';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "O.A.S.I.S. - Orbital Analytics and Space Information System",
  description: "O.A.S.I.S. is a predictive analytics platform for assessing and forecasting near-Earth space environments. Utilizing data from NASA, NOAA, and space-track.org, it provides critical insights for satellite operations, space missions, and space environment forecasting."
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="icon" href="/assets/images/favicon.ico" type="image/ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}