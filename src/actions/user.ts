"use server"

import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {db} from "@/lib/db";

export async function DeleteUser( id:string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

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