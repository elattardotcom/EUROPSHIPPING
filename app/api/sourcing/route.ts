import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const clientId = req.cookies.get("client_id")?.value
  if (!clientId) return NextResponse.json([], { status: 401 })

  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json([])

  const { data } = await sb
    .from("sourcing_requests")
    .select("id,product_name,reference_url,quantity,budget_eur,notes,admin_reply,image_url,status,created_at")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })

  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const clientId = req.cookies.get("client_id")?.value
  if (!clientId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: "DB non configurée" }, { status: 500 })

  const contentType = req.headers.get("content-type") ?? ""
  let product_name = "", reference_url = null as string | null,
      quantity = null as number | null, budget_eur = null as number | null,
      notes = null as string | null, image_url = null as string | null

  if (contentType.includes("multipart/form-data")) {
    const fd = await req.formData()

    product_name  = ((fd.get("product_name")  as string) ?? "").trim()
    reference_url = (fd.get("reference_url")  as string) || null
    quantity      = parseInt(fd.get("quantity")  as string) || null
    budget_eur    = parseFloat(fd.get("budget_eur") as string) || null

    const parts = [
      fd.get("destination") ? `Destination: ${fd.get("destination")}` : "",
      fd.get("shipping")    ? `Expédition: ${fd.get("shipping")}`     : "",
      (fd.get("notes") as string) || "",
    ].filter(Boolean)
    notes = parts.length ? parts.join("\n") : null

    const imageFile = fd.get("image") as File | null
    if (imageFile && imageFile.size > 0) {
      try {
        const bytes  = await imageFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const ext    = imageFile.name.split(".").pop() ?? "jpg"
        const path   = `${clientId}/${Date.now()}.${ext}`

        const { data: up, error: upErr } = await sb.storage
          .from("sourcing-images")
          .upload(path, buffer, { contentType: imageFile.type, upsert: false })

        if (!upErr && up) {
          const { data: { publicUrl } } = sb.storage
            .from("sourcing-images")
            .getPublicUrl(up.path)
          image_url = publicUrl
        }
      } catch {
        // image upload failed — proceed without it
      }
    }
  } else {
    const body = await req.json()
    product_name  = (body.product_name ?? "").trim()
    reference_url = body.reference_url || null
    quantity      = body.quantity      || null
    budget_eur    = body.budget_eur    || null
    notes         = body.notes         || null
    image_url     = body.image_url     || null
  }

  if (!product_name) {
    return NextResponse.json({ error: "Nom du produit requis" }, { status: 400 })
  }

  const { data: client } = await sb
    .from("clients")
    .select("first_name,last_name")
    .eq("id", clientId)
    .single()
  const client_name = client
    ? `${client.first_name ?? ""} ${client.last_name ?? ""}`.trim()
    : ""

  const { error } = await sb.from("sourcing_requests").insert({
    client_id: clientId,
    client_name,
    product_name,
    reference_url,
    quantity,
    budget_eur,
    notes,
    image_url,
    status: "PENDING",
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
