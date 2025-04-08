import { getPostBySlug } from "../../../lib/posts";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import Styles from "../page.module.css";
import Image from "next/image";

// Generate SEO metadata
export async function generateMetadata(props) {
  const params = await props.params;
  const post = getPostBySlug(params.slug);
  if (!post) return notFound();

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: [
        {
          url: post.img,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.img],
    },
  };
}

export default async function PostPage(props) {
  const params = await props.params;
  const post = getPostBySlug(params.slug);
  if (!post) return notFound();

  const publishedDate = new Date(post.date).toISOString();

  return (
    <section className={Styles.section}>
      {/* Schema.org structured data for Article */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description,
            image: post.img,
            author: {
              "@type": "Person",
              name: post.author || "Admin",
            },
            publisher: {
              "@type": "Organization",
              name: "Nama Situs Kamu", // ganti sesuai nama blog
              logo: {
                "@type": "ImageObject",
                url: "https://domainkamu.com/logo.png", // ganti logo situs
              },
            },
            datePublished: publishedDate,
          }),
        }}
      />

      <article className={Styles.singlePost}>
        <h1>{post.title}</h1>
        <div className={Styles.postInfo}>
          <time dateTime={publishedDate}>{post.date}</time>
          <p>{post.author}</p>
        </div>
        <Image src={post.img} width={1920} height={1080} alt={post.title} />
        <Markdown>{post.content}</Markdown>
      </article>
    </section>
  );
}
