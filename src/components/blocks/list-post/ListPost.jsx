"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Styles from "./listpost.module.css";
import Pagination from "../pagination/Pagination";

// Fungsi bantu untuk format kategori
const formatCategory = (slug) => {
  const specialCases = {
    seo: "SEO",
    "ui-ux": "UI/UX",
  };

  if (specialCases[slug.toLowerCase()]) {
    return specialCases[slug.toLowerCase()];
  }

  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function ListPosts({ posts }) {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  // Urutkan post dari yang terbaru ke yang terlama
  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Hitung total halaman
  const totalPages = Math.ceil(sortedPosts.length / postsPerPage);

  // Ambil data untuk halaman sekarang
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = sortedPosts.slice(indexOfFirstPost, indexOfLastPost);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" }); // auto scroll ke atas saat ganti halaman
  };

  return (
    <>
      <section className={Styles.section}>
        <div className={Styles.cardContainer}>
          {currentPosts.map((post) => {
            const description =
              post.description.length > 140
                ? post.description.slice(0, 140) + " ..."
                : post.description;

            return (
              <Link key={post.slug} href={`/${post.slug}`} passHref>
                <div className={Styles.card}>
                  <div className={Styles.thumbnail}>
                    <Image
                      src={post.img}
                      width={1920}
                      height={1080}
                      alt={post.title}
                    />
                  </div>
                  <div className={Styles.postMeta}>
                    <div>
                      <p className={Styles.category}>
                        {formatCategory(post.category)}
                      </p>
                      <time
                        dateTime={
                          new Date(post.date).toISOString().split("T")[0]
                        }
                      >
                        {post.date}
                      </time>
                    </div>
                    <h2>{post.title}</h2>
                    <p>{description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </>
  );
}
