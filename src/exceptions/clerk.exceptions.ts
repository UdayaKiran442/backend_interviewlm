export class CheckUserInClerkError extends Error {
	public cause?: unknown;
	constructor(message: string, options?: { cause?: unknown }) {
		super(message);
		this.name = "CheckUserInClerkError";
		if (options?.cause) this.cause = options.cause;
		Error.captureStackTrace(this, this.constructor);
	}
}

export class CreateUserInClerkServiceError extends Error {
	public cause?: unknown;
	constructor(message: string, options?: { cause?: unknown }) {
		super(message);
		this.name = "CreateUserInClerkServiceError";
		if (options?.cause) this.cause = options.cause;
		Error.captureStackTrace(this, this.constructor);
	}
}