import React from "react";
import Card from "@/components/ui/card/Card";
import Styles from "./relatedposts.module.css";

export default function RelatedPosts({ currentPostId, category, posts }) {
  const relatedPosts = posts
    .filter((post) => post.category === category && post.id !== currentPostId)
    .slice(0, 6); // ✅ batasi 3 artikel

  if (relatedPosts.length === 0) return null;

  return (
    <div className={Styles.relatedSection}>
      <h2>Artikel Terkait</h2>
      <div className={Styles.relatedGrid}>
        {relatedPosts.map((post) => (
          <Card
            key={post.id}
            title={post.title}
            category={post.category}
            url={post.url}
            images={post.image}
            date={post.date}
          />
        ))}
      </div>
    </div>
  );
}
