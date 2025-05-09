import React from "react";
import Styles from "./footer.module.css";
import Link from "next/link";
import { Instagram, Facebook, Twitter, Linkedin } from "lucide-react";

const socialLinks = [
  {
    href: "https://www.instagram.com/thisisme_aji/",
    icon: <Instagram size={20} strokeWidth={1.5} />,
  },
  {
    href: "https://www.facebook.com/profile.php?id=100090748616081",
    icon: <Facebook size={20} strokeWidth={1.5} />,
  },
  {
    href: "https://x.com/thisismeaji",
    icon: <Twitter size={20} strokeWidth={1.5} />,
  },
  {
    href: "https://www.linkedin.com/in/ajisaka-kamandanu-0870a6349/",
    icon: <Linkedin size={20} strokeWidth={1.5} />,
  },
];

const pageLinks = [
  { href: "/tentang", label: "Tentang" },
  { href: "/kontak", label: "Kontak" },
  { href: "/kebijakan-privasi", label: "Kebijakan Privasi" },
  { href: "/syarat-dan-ketentuan", label: "Syarat dan Ketentuan" },
];

export default function Footer() {
  return (
    <footer className={Styles.footer}>
      <ul className={Styles.pages}>
        {socialLinks.map((social, index) => (
          <li key={index}>
            <Link href={social.href} target="_blank" rel="noopener noreferrer">
              {social.icon}
            </Link>
          </li>
        ))}
      </ul>
      <ul className={Styles.pages}>
        {pageLinks.map((page, index) => (
          <li key={index}>
            <Link href={page.href}>{page.label}</Link>
          </li>
        ))}
      </ul>
      <p>© 2025 Vurply. All Rights Reserved.</p>
    </footer>
  );
}
