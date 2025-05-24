import React from "react";
import Styles from "./navbar.module.css";
import Link from "next/link";
import MobileNav from "./MobileNav";
import Image from "next/image";

const navLinks = [
  {
    name: "Beranda",
    href: "/",
  },
  {
    name: "Product Roadmap",
    href: "/product-roadmap",
  },
  {
    name: "Costumer Feedback",
    href: "/costumer-feedback",
  },
  {
    name: "Product Management",
    href: "/product-management",
  },
];

export default function Navbar() {
  return (
    <nav className={Styles.nav}>
      <div className={Styles.logo}>
        <Link href="/">
          <Image
            src="/images/logo.png"
            width={512}
            height={512}
            alt="Logo Vurply.com"
          />
          <p>Vurply.com</p>
        </Link>
      </div>
      <MobileNav navLinks={navLinks} />
    </nav>
  );
}
