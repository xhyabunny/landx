import { database } from "@/utils/appwrite";
import { Query } from "appwrite";

export const getUserPosts = async (userId: string) => {
    try {
        let posts = await database.listDocuments("db", "6691dc57001fe88831c7", [Query.contains("author", userId)]);
        return { result: "done", info: posts.documents };
    } catch (error) {
        return { result: error };
    }
};