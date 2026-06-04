import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db()
    const users = await db.collection("users").find({}).toArray()
    return NextResponse.json(users)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: "Method Not Allowed. User registration is disabled." },
    { status: 405 }
  )
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updateData } = body
    if (id === undefined) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()
    
    await db.collection("users").updateOne(
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
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()
    
    // Soft delete
    await db.collection("users").updateOne(
      { id: Number(id) },
      { $set: { status: "Deleted" } }
    )
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
