import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/blocks/navbar/Navbar";
import Footer from "@/components/blocks/footer/Footer";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Vurply",
  description: "Teman Baca mu Setiap Saat",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <header>
          <Navbar />
        </header>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
