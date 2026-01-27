import "./globals.css";
import ClientProviders from "./ClientProviders";

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <head>
        <title>amigo.sh</title>
        <meta name="description" content="Transport de intentie. CLI + Room." />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
