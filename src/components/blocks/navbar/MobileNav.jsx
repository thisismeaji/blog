"use client";

import { useState } from "react";
import Link from "next/link";
import Styles from "./navbar.module.css";

export default function MobileNav({ navLinks }) {
  const [menuActive, setMenuActive] = useState(false);

  const toggleMenu = () => setMenuActive(!menuActive);
  const closeMenu = () => setMenuActive(false);

  return (
    <>
      <ul className={`${Styles.navLinks} ${menuActive ? Styles.active : ""}`}>
        {navLinks.map(({ href, name }) => (
          <li key={href}>
            <Link href={href} onClick={closeMenu}>
              {name}
            </Link>
          </li>
        ))}
      </ul>
      <div className={Styles.menu} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
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
