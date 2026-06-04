import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { hashPassword } from "@/lib/crypto"

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
  try {
    const body = await req.json()
    const { password, ...userData } = body
    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()
    
    const lastItem = await db.collection("users").find().sort({ id: -1 }).limit(1).toArray()
    const newId = lastItem.length > 0 ? (lastItem[0].id || 0) + 1 : 1

    const hashedPassword = hashPassword(password)

    const newUser = {
      ...userData,
      id: newId,
      password: hashedPassword,
    }

    await db.collection("users").insertOne(newUser)
    return NextResponse.json({ success: true, user: newUser })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, password, ...updateData } = body
    if (id === undefined) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()
    
    const setObj: any = { ...updateData }
    if (password) {
      setObj.password = hashPassword(password)
    }
    
    await db.collection("users").updateOne(
      { id: Number(id) },
      { $set: setObj }
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
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()
    
    if (permanent) {
      // Hard delete
      await db.collection("users").deleteOne({ id: Number(id) })
    } else {
      // Soft delete
      await db.collection("users").updateOne(
        { id: Number(id) },
        { $set: { status: "Deleted" } }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

