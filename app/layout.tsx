import "./globals.css";

export const metadata = {
  title: "Zeropoint Protocol — Local Appliance",
  description: "Local-only agentic AI appliance",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-black">
      <body className="h-full overflow-hidden antialiased">{children}</body>
    </html>
  );
}
