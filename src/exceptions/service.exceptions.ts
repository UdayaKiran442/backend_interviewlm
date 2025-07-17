export class UploadFileToGCPError extends Error {
    public cause?: unknown;
    constructor(message: string, options?: { cause?: unknown }) {
        super(message);
        this.name = "UploadFileToGCPError";
        if (options?.cause) this.cause = options.cause;
        Error.captureStackTrace(this, this.constructor);
    }
}