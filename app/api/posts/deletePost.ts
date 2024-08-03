import { database } from "@/utils/appwrite"

export const deletePost = async (postid: string, userid: string) => {

    try {

        let userverify = await database.getDocument('db', '6691dc57001fe88831c7', postid)
        let postauthor = userverify.author;

        if(userid !== postauthor) return {result: 'permission denied'};

        await database.deleteDocument('db', '6691dc57001fe88831c7', postid)
        return {result: 'done'};

    } catch (error) {

        return {result: error};

    }

}