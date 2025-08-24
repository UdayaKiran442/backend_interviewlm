import { createClerkClient } from "@clerk/backend";

import { ActiveConfig } from "../utils/config.utils";
import { CheckUserInClerkError, CreateUserInClerkServiceError } from "../exceptions/clerk.exceptions";

const clerkClient = createClerkClient({
	secretKey: ActiveConfig.CLERK_SECRET_KEY,
});

export async function checkUserInClerkService(email: string): Promise<boolean> {
	try {
		return (await clerkClient.users.getCount({ emailAddress: [email] })) > 0;
	} catch (error) {
		throw new CheckUserInClerkError("Failed to check user in Clerk", { cause: (error as Error).message });
	}
}

export async function createUserInClerkService(email: string) {
	try {
		const password = Math.random().toString(36).slice(-8);
		const user = await clerkClient.users.createUser({
			emailAddress: [email],
			password,
		});
		return { ...user, password };
	} catch (error) {
		throw new CreateUserInClerkServiceError("Failed to create user in Clerk", { cause: (error as Error).message });
	}
}
