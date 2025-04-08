import React from "react";
import Styles from "./navbar.module.css";
import MobileNav from "./MobileNav";
import Link from "next/link";

export default function Navbar() {
  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/seo", label: "SEO" },
    { href: "/tutorial", label: "Tutorial" },
    { href: "/tips-dan-trik", label: "Tips dan Trik" },
    { href: "/strategi-content", label: "Strategi Content" },
    { href: "/opini-dan-trend", label: "Opini dan Trend" },
  ];
  return (
    <nav className={Styles.nav}>
      <a href="/">
        <div className={Styles.logo}>
          <h1>KelasSiang</h1>
        </div>
      </a>
      <MobileNav navLinks={navLinks} />
    </nav>
  );
}
