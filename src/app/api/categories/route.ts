import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db()
    const categories = await db.collection("categories").find({}).toArray()
    return NextResponse.json(categories)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const client = await clientPromise
    const db = client.db()
    
    const lastItem = await db.collection("categories").find().sort({ id: -1 }).limit(1).toArray()
    const newId = lastItem.length > 0 ? (lastItem[0].id || 0) + 1 : 1

    const newCategory = {
      ...body,
      id: newId,
    }

    await db.collection("categories").insertOne(newCategory)
    return NextResponse.json({ success: true, category: newCategory })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updateData } = body
    if (id === undefined) {
      return NextResponse.json({ error: "Missing category ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()
    
    await db.collection("categories").updateOne(
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
    const permanent = url.searchParams.get("permanent") === "true"
    if (!id) {
      return NextResponse.json({ error: "Missing category ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()
    
    if (permanent) {
      // Hard delete
      await db.collection("categories").deleteOne({ id: Number(id) })
    } else {
      // Soft delete
      await db.collection("categories").updateOne(
        { id: Number(id) },
        { $set: { status: "Deleted" } }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
