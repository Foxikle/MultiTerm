import type { RequestHandler } from "@sveltejs/kit";

export async function POST({ request, platform }) {
  try {
    let path = request.headers.get("x-file-path")
    let content = request.headers.get("x-file-content")
    if (!path || !content) {
      return Response.json({
        success: false,
        "detail": "File path or content is missing"
      }, {
        status: 400
      })
    }


    await platform?.env.DB.prepare(
      "INSERT INTO FileSystem(path, content, tags, created_at, modified_at) VALUES (?,?,?,?,?)"
    ).bind(path, content, "[]", Date.now(), Date.now()).run();

    return new Response(`Successfully created the file '${path}'.`);
  } catch (error) {
    if (error?.message.includes("UNIQUE constraint failed: FileSystem.path")) {
      return Response.json({ success: false, detail: `A file with that path already exists!` }, { status: 422 })
    }
    return Response.json({ success: false, detail: "Failed to create file.", "error": error.message },
      {
        status: 500
      });
  }
}
