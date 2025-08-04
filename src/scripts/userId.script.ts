import { eq } from "drizzle-orm";
import db from "../repository/db";
import { candidates, hr, users } from "../repository/schema";

export async function userIdScript(){
    try {
        // get all users from users table
        const allUsers = await db.select().from(users)
        console.log(`Total users: ${allUsers.length}`)

        // for each user, update the userId in hr table
        let count = 0
        for (const user of allUsers) {
            const hrUser = await db.select().from(hr).where(eq(hr.email, user.email))
            if (hrUser.length > 0) {
                await db.update(hr).set({userId: user.userId}).where(eq(hr.email, user.email))
                count++
                continue
            }
            const candidateUser = await db.select().from(candidates).where(eq(candidates.email, user.email))
            if (candidateUser.length > 0) {
                await db.update(candidates).set({ userId: user.userId }).where(eq(candidates.email, user.email))
                count++
                continue

            }
            console.log(`Total updated: ${count} out of ${allUsers.length}`)
        }
    } catch (error) {
        console.log(error)
    }
}