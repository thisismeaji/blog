"use client"; // Pastikan ini ada untuk menandakan komponen client-side

import { useState, useEffect } from "react";
import { SunMoon } from "lucide-react";
import Styles from "./navbar.module.css";
import Link from "next/link";

export default function MobileNav({ navLinks }) {
  const [menuActive, setMenuActive] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleMenu = () => setMenuActive(!menuActive);
  const closeMenu = () => setMenuActive(false);

  // Toggle Theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("theme", !isDarkMode ? "dark" : "light");
  };

  useEffect(() => {
    // Cek apakah ada preferensi tema yang disimpan di localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    } else {
      // Jika tidak ada preferensi, sesuaikan dengan preferensi sistem pengguna
      const prefersDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setIsDarkMode(prefersDarkMode);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <>
      <div className={`${Styles.listNav} ${menuActive ? Styles.active : ""}`}>
        <ul>
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} onClick={closeMenu}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className={Styles.menuMobile}>
        <div className={Styles.menu} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className={Styles.themeToggle} onClick={toggleTheme}>
          <SunMoon width={20} />
        </div>
      </div>
      <div
        className={`${Styles.overlay} ${
          menuActive ? Styles.overlayActive : ""
        }`}
        onClick={closeMenu}
      ></div>
    </>
  );
}
