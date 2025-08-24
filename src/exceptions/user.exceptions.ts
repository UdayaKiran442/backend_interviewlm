export class GetUserByEmailFromDBError extends Error {
    public cause?: unknown;
    constructor(message: string, options?: { cause?: unknown }) {
        super(message);
        this.name = "GetUserByEmailFromDBError";
        if (options?.cause) this.cause = options.cause;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class AddUserInDBError extends Error {
    public cause?: unknown;
    constructor(message: string, options?: { cause?: unknown }) {
        super(message);
        this.name = "AddUserInDBError";
        if (options?.cause) this.cause = options.cause;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class UpdateUserInDBError extends Error {
    public cause?: unknown;
    constructor(message: string, options?: { cause?: unknown }) {
        super(message);
        this.name = "UpdateUserInDBError";
        if (options?.cause) this.cause = options.cause;
        Error.captureStackTrace(this, this.constructor);
    }
}