import { getPostBySlug } from "../../../lib/posts";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import Styles from "../page.module.css";
import Image from "next/image";

export async function generateMetadata(props) {
  const params = await props.params;
  const post = getPostBySlug(params.slug);
  if (!post) return notFound();

  return {
    title: post.title,
    description: post.description,
  };
}

export default async function PostPage(props) {
  const params = await props.params;
  const post = getPostBySlug(params.slug);

  if (!post) return notFound();

  return (
    <section className={Styles.section}>
      <article className={Styles.singlePost}>
        <h1>{post.title}</h1>
        <div className={Styles.postInfo}>
          <time dateTime={new Date(post.date).toISOString().split("T")[0]}>
            {post.date}
          </time>
          <p>{post.author}</p>
        </div>
        <Image src={post.img} width={1920} height={1080} alt={post.title} />
        <Markdown>{post.content}</Markdown>
      </article>
    </section>
  );
}
