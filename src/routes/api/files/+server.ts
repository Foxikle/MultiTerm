export async function GET({ request, platform }) {
  try {
    let path = request.headers.get("x-file-path")
    if (path?.endsWith("/")) { // directory
      let data = await platform?.env.DB.prepare("SELECT * FROM FileSystem WHERE path LIKE ? || '%'")
        .bind(path).run();
      if (!data.results) {
        return Response.json({ success: false, detail: "The requested directory does not contain any files." }, {
          status: 404
        })
      }
      return Response.json({ success: true, data: data.results });
    }

    let data = await platform?.env.DB.prepare("SELECT * FROM FileSystem WHERE path = ?")
      .bind(path).run()
    data = data.results


    if (!data || data.length < 1) {
      return Response.json({ success: false, detail: "The requested file was not found." }, { status: 404 })
    }

    return Response.json({ success: true, data: data[0] })

  } catch (error) {
    return Response.json({ success: false, detail: error?.message }, { status: 500 })
  }
}

export async function POST({ request, platform }) {
  try {
    let path = request.headers.get("x-file-path")
    let content = request.headers.get("x-file-content")
    if (!content) content = ""
    if (!path) {
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

    return Response.json({ success: true, detail: `Successfully created the file '${path}'.` });
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

export async function PUT({ request, platform }) {
  try {
    let path = request.headers.get("x-file-path")
    let content = request.headers.get("x-file-content")
    if (!path || !content) {
      return Response.json({
        success: false,
        detail: "File path or content is missing"
      }, {
        status: 400
      })
    }

    let data = await platform?.env.DB.prepare("UPDATE FileSystem SET content = ?, modified_at = ? WHERE path = ?")
      .bind(content, Date.now(), path).run()
    if (data.meta.rows_written < 1) {
      return Response.json({ success: false, detail: `Failed to update the contents of the file '${path}'. Perhaps it doesn't exist.` }, { status: 404 })
    }

    return Response.json({ success: true, detail: "Successfully updated the file's contents." })

  } catch (error) {
    return Response.json({ success: false, detail: "Failed to update FileSystem.", "error": error?.message },
      { status: 500 });
  }
}

export async function DELETE({ request, platform }) {
  try {
    let path = request.headers.get("x-file-path")

    let data = await platform?.env.DB.prepare("DELETE FROM FileSystem WHERE path = ?")
      .bind(path).run()
    if (data.meta.rows_written < 1) {
      return Response.json({ success: false, detail: `Failed to delete the file '${path}'. Perhaps it doesn't exist?` }, { status: 404 })
    }

    return Response.json({ success: true, detail: "Successfully deleted the file." })

  } catch (error) {
    return Response.json({ success: false, detail: "Failed to delete file.", "error": error?.message },
      { status: 500 });
  }
}

