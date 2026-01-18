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
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
