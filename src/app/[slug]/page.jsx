import { getPostByUrl, getAllPosts } from "../../../lib/posts";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Styles from "../page.module.css";
import Image from "next/image";
import Badge from "@/components/ui/badge/Badge";
import Author from "@/components/ui/author/Author";
import RelatedPosts from "@/components/blocks/relatedposts/RelatedPosts";

export async function generateMetadata(props) {
  const params = await props.params;
  const post = getPostByUrl(params.slug);
  if (!post) return {};

  return {
    title: post.titletags,
    description: post.metatags,
  };
}

export default async function PostPage(props) {
  const params = await props.params;
  const post = getPostByUrl(params.slug);

  if (!post) {
    notFound();
  }

  const posts = getAllPosts();

  return (
    <>
      <section className={Styles.singlePost}>
        <article className={Styles.article}>
          <div className={Styles.postInfo}>
            <Badge text={post.category} />
            <h1>{post.title}</h1>
            <p>{post.metatags}</p>
            <Author />
          </div>

          {/* Hanya tampilkan gambar jika post.image ada */}
          {post.image && (
            <Image
              src={post.image}
              alt={post.title}
              width={1920}
              height={1080}
              className={Styles.thumbnail}
            />
          )}

          <div className={Styles.content}>
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </article>
      </section>
      <section>
        <RelatedPosts
          currentPostId={post.id}
          category={post.category}
          posts={posts}
        />
      </section>
    </>
  );
}
