import React from "react";
import Image from "next/image";
import Styles from "./author.module.css";

export default function Author() {
  return (
    <div className={Styles.author}>
      <Image
        src="/images/avatar/avatar.jpeg"
        width={512}
        height={512}
        alt="Ajisaka Kamandanu"
      />
      <div>
        <p>Ajisaka Kamandanu</p>
        <p>IT Specialist</p>
      </div>
    </div>
  );
}
