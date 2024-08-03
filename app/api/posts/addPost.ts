import { database } from "@/utils/appwrite";
import { ID } from "appwrite";

interface Props {
    author: string | undefined;
    name: string;
    pfp: string | null;
    description: string;
    data: string;
    colors: string[];
    fonts: string[];
    font__weight: string;
    page__style: string;
    stack: string;
    prompt: string;
}

export const addPost = async (data : Props) => {

    try {

        let post = await database.createDocument('db', '6691dc57001fe88831c7', ID.unique(), {
            author: data.author,
            likes: 0,
            name: data.name,
            pfp: data.pfp,
            description: data.description,
            data: data.data,
            colors: data.colors,
            fonts: data.fonts,
            font__weight: data.font__weight,
            page__style: data.page__style,
            stack: data.stack,
            prompt: data.prompt
        });
    
        return {result: 'done', postId: post.$id}

    } catch (error) {

        return {result: error}

    }

}
