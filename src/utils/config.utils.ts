/**
 * Configuration Utility Module
 *
 * This module loads environment variables from the appropriate .env file
 * based on the current environment (development or production).
 * It exports a configuration object with essential environment variables.
 */
import * as dotenv from "dotenv";

// Determine the current environment
const environment = process.env.NODE_ENV;

// Load environment-specific configuration
if (environment === "development") {
    // Load development environment variables
    dotenv.config({ path: "../../.env.development" });
} else {
    // Load production environment variables
    dotenv.config({ path: "../../.env.production" });
}

/**
 * Active configuration object containing essential environment variables
 *
 * This object provides access to environment-specific configuration values
 * that are used throughout the application.
 */
export const ActiveConfig = {
    ENV: process.env.ENV ?? "development",
    DATABASE_URL: process.env.DATABASE_URL ?? "",
    GCP_BUCKET_NAME: process.env.GCP_BUCKET_NAME ?? "",
    LLAMAINDEX_API: process.env.LLAMAINDEX_API ?? "",
    RESUME_VECTOR_DB: process.env.RESUME_VECTOR_DB ?? "",
    JD_VECTOR_DB: process.env.JD_VECTOR_DB ?? "",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
    PINECONE_API_KEY: process.env.PINECONE_API_KEY ?? "",
    RESUME_INDEX: process.env.RESUME_INDEX ?? "",
    JD_INDEX: process.env.JD_INDEX ?? "",
};
