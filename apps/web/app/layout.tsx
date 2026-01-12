import "./globals.css";

export const metadata = {
  title: "amigo.sh",
  description: "Transport de intentie. CLI + Room."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
