import type { Metadata } from 'next';
import './styles.css';

export const metadata: Metadata = {
  title: 'Zviripo',
  description: "Zimbabwe's everyday commerce network",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
