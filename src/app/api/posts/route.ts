import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db()
    const posts = await db.collection("posts").find({}).toArray()
    return NextResponse.json(posts)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const client = await clientPromise
    const db = client.db()
    
    // Find highest ID to auto-increment
    const lastItem = await db.collection("posts").find().sort({ id: -1 }).limit(1).toArray()
    const newId = lastItem.length > 0 ? (lastItem[0].id || 0) + 1 : 1

    const newPost = {
      ...body,
      id: newId,
    }

    await db.collection("posts").insertOne(newPost)
    return NextResponse.json({ success: true, post: newPost })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updateData } = body
    if (id === undefined) {
      return NextResponse.json({ error: "Missing post ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()
    
    await db.collection("posts").updateOne(
      { id: Number(id) },
      { $set: updateData }
    )
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "Missing post ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()
    
    // Soft delete
    await db.collection("posts").updateOne(
      { id: Number(id) },
      { $set: { status: "Deleted" } }
    )
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
