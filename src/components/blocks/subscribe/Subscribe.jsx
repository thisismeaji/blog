import React from "react";
import Styles from "./subscribe.module.css";

export default function Subscribe() {
  return (
    <section className={Styles.section}>
      <div className={Styles.content}>
        <h2>Temukan insight baru setiap minggunya.</h2>
        <p>
          Subscribe untuk artikel pilihan, tips bermanfaat, dan update konten
          terbaru dari berbagai topik menarik.
        </p>
        <div className={Styles.subscribe}>
          <input type="email" placeholder="Email kamu" />
          <button>Subscribe</button>
        </div>
      </div>
    </section>
  );
}
