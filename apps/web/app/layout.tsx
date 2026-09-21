import type { Metadata } from 'next';
import './styles.css';

export const metadata: Metadata = {
  title: {
    default: 'Zviripo — Zimbabwe’s everyday marketplace',
    template: '%s · Zviripo',
  },
  description:
    'Find products, shops, services and opportunities near you — or sell from your own shop, online or off.',
  icons: { icon: '/brand/zviripo-mark-night-192.png' },
  openGraph: {
    siteName: 'Zviripo',
    title: 'Zviripo — Zimbabwe’s everyday marketplace',
    description:
      'Find products, shops, services and opportunities near you — or sell from your own shop, online or off.',
    type: 'website',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
