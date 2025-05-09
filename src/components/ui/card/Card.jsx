import React from "react";
import Styles from "./card.module.css";
import Link from "next/link";
import Image from "next/image";
import Badge from "../badge/Badge";
import Author from "../author/Author";

export default function Card({ title, category, url, images, date }) {
  const dateObj = new Date(date);
  const formattedDate = `${dateObj.getDate()} ${dateObj.toLocaleString(
    "id-ID",
    { month: "long" }
  )}, ${dateObj.getFullYear()}`;

  return (
    <Link href={url}>
      <div className={Styles.card}>
        <div className={Styles.thumbnail}>
          <Image src={images} width={1600} height={1280} alt={title} />
        </div>
        <div className={Styles.postMeta}>
          <div>
            <Badge text={category} />
            <p className={Styles.date}>{formattedDate}</p>
          </div>
          <h2>{title}</h2>
          <Author />
        </div>
      </div>
    </Link>
  );
}
