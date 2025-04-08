import React from "react";
import Styles from "./page.module.css";
import ListPost from "@/components/blocks/list-post/ListPost";
import { getAllPosts } from "../../lib/posts";

export default async function Page() {
  const posts = await getAllPosts(); // Ambil data posts dari fungsi getAllPosts()

  return (
    <>
      <ListPost posts={posts} /> {/* Pass posts ke komponen ListPost */}
    </>
  );
}
