"use server"

import { getCachedSession } from "@/lib/session";
import {db} from "@/lib/db";

export async function DeleteUser( id:string) {
    const session = await getCachedSession()

    if (!session) {
        return {error: "Non authentifié"}
    }
     await db.user.delete(
        {
            where: {id}
        }
    )
    return { success: true }
}