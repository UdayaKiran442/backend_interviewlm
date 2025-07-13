export class CreateJobInDBError extends Error {
    public cause?: unknown;
    constructor(message: string, options?: { cause?: unknown }) {
        super(message);
        this.name = "CreateJobInDBError";
        if (options?.cause) this.cause = options.cause;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class CreateJobError extends Error {
    public cause?: unknown;
    constructor(message: string, options?: { cause?: unknown }) {
        super(message);
        this.name = "CreateJobError";
        if (options?.cause) this.cause = options.cause;
        Error.captureStackTrace(this, this.constructor);
    }
}