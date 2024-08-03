export async function POST(req: Request) {
	const { apiKey, api }: { apiKey: string; api: string } = await req.json();
	return Response.json({ message: "API Key saved" });
}
