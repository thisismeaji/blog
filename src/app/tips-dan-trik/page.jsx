import ListPosts from "@/components/blocks/list-post/ListPost";
import { getAllPosts } from "../../../lib/posts";
import React from "react";

export default function Page() {
  const posts = getAllPosts();

  // Filter hanya kategori "seo"
  const seoPosts = posts.filter(
    (post) => post.category.toLowerCase() === "tips-dan-trik"
  );

  return (
    <>
      <ListPosts posts={seoPosts} />
    </>
  );
}
