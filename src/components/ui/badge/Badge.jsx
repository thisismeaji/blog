import React from "react";
import Styles from "./badge.module.css";
import Link from "next/link";

export default function Badge({ text, href }) {
  if (!href) {
    return <span className={Styles.badge}>{text}</span>;
  }
  return (
    <Link href={href}>
      <span className={Styles.badge}>{text}</span>
    </Link>
  );
}
