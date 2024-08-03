import { database } from "@/utils/appwrite"

export const updatePost = async ({ data, postId, userId } : { data: string, postId: string, userId: string }) => {

    try {

        let userverify = await database.getDocument('db', '6691dc57001fe88831c7', postId)
        let postauthor = userverify.author;

        if(userId !== postauthor) return {result: 'permission denied'};

        await database.updateDocument('db', '6691dc57001fe88831c7', postId, {
            data: data
        })
        
        return {result: 'done'}

    } catch (error) {

        return {result: error}

    }

}