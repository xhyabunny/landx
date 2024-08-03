export async function POST(req: Request) {
    try {
        const { generation, promptConfig, author } = await req.json();

        // Regex para manejar tres backticks, nombre del archivo y contenido
        const regex = /```([^`]+?)\n([\s\S]*?)```/g;
        const result: { [key: string]: string } = {};

        let match;
        while ((match = regex.exec(generation)) !== null) {

            const [_, fileName, content] = match;

            if (fileName && content) {
                result[fileName.trim()] = content.trim();
            } else {
                console.error('Unexpected match format:', match);
            }
        }

        switch (promptConfig.tech__stack) {
            case "React":
                break;
            case "Vanilla":
                result['package.json'] = JSON.stringify({
                    name: promptConfig.landing__name.toLowerCase().split(' ').join('-') || "myProj-" + crypto.randomUUID().toString(),
                    author: author,
                    scripts: { "start": "npm i && npx http-server -c-1 ." },
                    dependencies: { "http-server": "^14.0.0" },
                    stackblitz: { "installDependencies": true, "startCommand": "npm start" },
                }, null, 2);
                break;
        }

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error processing request:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
