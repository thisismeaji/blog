import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/blocks/navigation/Navbar";
import Footer from "@/components/blocks/footer/Footer";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "My First Blog",
  description: "My First Blog",
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
