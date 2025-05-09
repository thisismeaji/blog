import React from "react";
import Styles from "./allposts.module.css";
import { getAllPosts } from "../../../../lib/posts";
import Card from "@/components/ui/card/Card";

export default function AllPosts() {
  const posts = getAllPosts();
  const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <section>
      <div className={Styles.cardContainer}>
        {sortedPosts.map((post) => (
          <Card
            key={`${post.id}-${post.url}`}
            title={post.title}
            category={post.category}
            url={post.url}
            images={post.image}
            date={post.date}
          />
        ))}
      </div>
    </section>
  );
}
