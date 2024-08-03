import { database } from "@/utils/appwrite"

export const updateUser = async ({ profilePhoto, gitHub, userId } : { profilePhoto: string, gitHub: string | null, userId: string }) => {

    try {

        await database.updateDocument('db', '6691dc510030619fb5f9', userId, {
            pfp: profilePhoto,
            github: gitHub
        })
        
        return {result: 'done'}

    } catch (error) {

        return {result: error}

    }

}