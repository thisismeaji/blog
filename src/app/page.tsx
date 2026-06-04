import Link from "next/link";
import clientPromise from "@/lib/mongodb";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen, User, Calendar } from "lucide-react";

import { unstable_cache } from "next/cache";

const getCachedPublishedPosts = unstable_cache(
  async () => {
    try {
      const client = await clientPromise;
      const db = client.db();
      const posts = await db
        .collection("posts")
        .find({ status: "Done" })
        .sort({ id: -1 })
        .toArray();
      return JSON.parse(JSON.stringify(posts));
    } catch (error) {
      console.error("Failed to fetch published posts", error);
      return [];
    }
  },
  ["published-posts"],
  {
    tags: ["posts-public"],
    revalidate: 60, // Fallback revalidation every 60 seconds
  }
);

export default async function Home() {
  const posts = await getCachedPublishedPosts();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col font-sans">
      {/* Premium Public Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md select-none">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <div className="p-1.5 rounded-lg bg-primary text-primary-foreground">
              <BookOpen className="size-4" />
            </div>
            <span>MyBlog</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/login"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-xs"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Public Feed */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 md:py-12">
        <div className="space-y-2 mb-10 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Latest Publications
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Read articles, stories, and tutorials written by our authors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post: any) => {
            const formattedDate = post.publishDate
              ? new Date(post.publishDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Recent";

            return (
              <Card
                key={post.id}
                className="flex flex-col h-full bg-background border hover:ring-2 hover:ring-primary/20 transition-all duration-200 shadow-xs hover:shadow-sm group overflow-hidden"
              >
                {/* Post Featured Image Preview */}
                <div className="relative w-full h-44 bg-muted overflow-hidden">
                  {post.uploadedImage ? (
                    <img
                      src={post.uploadedImage}
                      alt={post.header}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 bg-zinc-100 dark:bg-zinc-900 select-none">
                      <BookOpen className="size-8" />
                    </div>
                  )}
                  {post.type && (
                    <Badge className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white hover:bg-black/80 capitalize text-[10px] border-none font-medium">
                      {post.type}
                    </Badge>
                  )}
                </div>

                <CardHeader className="p-5 pb-3">
                  <CardTitle className="text-base font-bold line-clamp-2 leading-snug group-hover:text-primary transition-colors text-foreground">
                    {post.header}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-5 pt-0 flex-1 flex flex-col justify-between gap-4">
                  <CardDescription className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {post.excerpt || "No summary available for this article."}
                  </CardDescription>

                  <div className="pt-4 border-t flex items-center justify-between text-[11px] text-muted-foreground select-none">
                    <div className="flex items-center gap-1.5">
                      <User className="size-3" />
                      <span className="font-medium truncate max-w-[80px]">{post.reviewer || "Author"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {posts.length === 0 && (
            <div className="col-span-full py-16 text-center border border-dashed rounded-xl bg-background/50">
              <BookOpen className="size-10 mx-auto text-muted-foreground/30 mb-3" />
              <h3 className="text-base font-semibold text-foreground">No articles published yet</h3>
              <p className="text-xs text-muted-foreground mt-1">Check back later for new updates.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
