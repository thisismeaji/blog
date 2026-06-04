import clientPromise from "@/lib/mongodb";
import AddPostForm from "./add-post-form";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const id = params.id;

  const client = await clientPromise;
  const db = client.db();

  // 1. Fetch categories
  const categoriesRaw = await db
    .collection("categories")
    .find({ status: { $ne: "Deleted" } })
    .toArray();
  const categories = JSON.parse(JSON.stringify(categoriesRaw));

  // 2. Fetch users
  const usersRaw = await db
    .collection("users")
    .find({ status: { $ne: "Deleted" } })
    .toArray();
  const users = JSON.parse(JSON.stringify(usersRaw));

  // 3. Fetch post if editing
  let initialPostData = null;
  if (id) {
    const postRaw = await db.collection("posts").findOne({ id: Number(id) });
    if (postRaw) {
      initialPostData = JSON.parse(JSON.stringify(postRaw));
    }
  }

  return (
    <AddPostForm
      initialPostData={initialPostData}
      initialCategories={categories}
      initialUsers={users}
      editId={id ? Number(id) : undefined}
    />
  );
}
