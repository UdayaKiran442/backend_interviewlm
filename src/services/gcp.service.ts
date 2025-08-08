import { Storage } from "@google-cloud/storage";
import { ActiveConfig } from "../utils/config.utils";
import { UploadFileToGCPServiceError } from "../exceptions/gcp.exceptions";

export async function uploadFileToGCPService(payload: { filePath: string, fileName: string }) {
    try {
        const storage = new Storage({
            projectId: "interviewlm-466206",
            keyFilename: "interviewlm_gcp.json",
        });
        await storage.bucket(ActiveConfig.GCP_BUCKET_NAME).upload(payload.filePath, {
            destination: payload.fileName,
        })
    } catch (error) {
        throw new UploadFileToGCPServiceError('Failed to upload file to GCP', { cause: (error as Error).message });
    }
}