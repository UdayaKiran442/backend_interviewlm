export class InsertRoundResultsToDBError extends Error {
    public cause?: unknown;
    constructor(message: string, options?: { cause?: unknown }) {
        super(message);
        this.name = "InsertRoundResultsToDBError";
        if (options?.cause) this.cause = options.cause;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class GetRoundResultFromDBError extends Error {
    public cause?: unknown;
    constructor(message: string, options?: { cause?: unknown }) {
        super(message);
        this.name = "GetRoundResultFromDBError";
        if (options?.cause) this.cause = options.cause;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class UpdateRoundResultInDBError extends Error {
    public cause?: unknown;
    constructor(message: string, options?: { cause?: unknown }) {
        super(message);
        this.name = "UpdateRoundResultInDBError";
        if (options?.cause) this.cause = options.cause;
        Error.captureStackTrace(this, this.constructor);
    }
}
