import './globals.css';

export const metadata = {
  title: 'Token Price Oracle',
  description: 'Historical cryptocurrency token prices with interpolation',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen p-4 md:p-8">
        <main className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Historical Token Price Oracle
          </h1>
          {children}
        </main>
      </body>
    </html>
  );
}
