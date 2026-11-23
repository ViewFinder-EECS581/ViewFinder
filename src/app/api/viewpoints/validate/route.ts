import { validateViewpointRequest } from "@/lib/validation/viewpoint";

// Validates only: nothing is stored here. Viewpoints are still saved in
// localStorage by the client after this check passes.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "The request must be JSON." },
      { status: 400 },
    );
  }

  const result = validateViewpointRequest(body);
  return Response.json(result.body, { status: result.status });
}
