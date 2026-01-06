import "./globals.css";
import Header from "./components/Header";

export const metadata = {
  title: "Deklata",
  description: "Student item sharing platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Global Hamburger Header */}
        <Header />

        {/* Page Content */}
        <main
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "32px 20px",
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
