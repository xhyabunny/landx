import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { Api } from "@/types";
import { qualityPrompt } from "@/utils";

interface ReqType {
  prompt: string;
  api: Api;
  techStack: string;
}

export async function POST(req: Request) {
  try {
    const { prompt, api, techStack }: ReqType = await req.json();

    let text = "";
	  let system = `- Take carefully into account the user input specifications when building the page.
- The page should have bordered and stylized outlines, or shadows.
- Make sure to do a good color use so everything is visible and satisfying, most important, texts.
- Add more info in the body of the page and an image if you can, that resembles the user's color choice
- Do not leave big empty spaces, fill info with lorem ipsum text if needed

PLEASE DO NOT RESPOND WITH ANNOTATIONS OR COMMENTS, PROMPT JUST THE CODE AND ONLY THE CODE.
PLEASE ALWAYS VARIATE ON STYLES, BORDERS, SHADOWS, OUTLINES, PAGE STRUCTURE

Example of how you should prompt the code:

"\`\`\`path/to/file
content of file
\`\`\`
%fileSeparation%
\`\`\`path/to/file
content of file
\`\`\`" respect this 

- Separate the styles into a CSS file
- REMEMBER The files should be created for a ${techStack} kind of webpage, so you should prompt all the files needed for the framework to work.
- This is very important as we need the path and file to be specifically that way to create a file tree.

${techStack === 'React' && 
`
The file structure for this one should be this way
src/index.js
src/index.css
public/index.html

do never forget any file please, these are so important
ReactDOM.render is no longer supported in React 18. Use createRoot instead and use react-dom/client package.
`}
${techStack === 'Vanilla' && 
`
The file structure for this one should be this way 

"\`\`\`index.html
content of file
\`\`\`
%fileSeparation%
\`\`\`index.css
content of file
\`\`\`"
`}
`

    if (api.apiProvider === "OpenAI") {
      const openaiProvider = createOpenAI({ apiKey: api.apiKey });
      const response = await generateText({
        model: openaiProvider("gpt-4-turbo"),
        system: system,
        prompt,
      });
      text = response.text;
    } else if (api.apiProvider === "Llama3") {
      const groq = createOpenAI({
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: api.apiKey,
      });
      const response = await generateText({
        model: groq("llama3-8b-8192"),
        system: system,
        prompt,
      });
      text = response.text;
    } else {
      // Free provider logic
      const groq = createOpenAI({
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: process.env.GROQ_API_KEY,
      });
      const response = await generateText({
        model: groq("llama3-8b-8192"),
        system: system,
        prompt,
      });
      text = response.text;
    }

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
