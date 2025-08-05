import { Hono } from "hono";
import { extractTextFromDoc, uploadFileToGCP } from "../../controller/service.controller";
import { ExtractTextFromDocError, UploadFileToGCPError } from "../../exceptions/service.exceptions";
import { UploadFileToGCPServiceError } from "../../exceptions/gcp.exceptions";
import { ParsePDFLangchainError } from "../../exceptions/langchain.exceptions";

const serviceRoute = new Hono();

serviceRoute.post('/gcp/upload', async (c) => {
    try {
        const payload = await c.req.formData();
        const file = payload.get("file") as File
        const uploadLink = await uploadFileToGCP({ file })
        return c.json({ success: true, message: 'File uploaded successfully', uploadLink }, 200)
    } catch (error) {
        if (error instanceof UploadFileToGCPError || error instanceof UploadFileToGCPServiceError) {
            return c.json({ success: false, message: error.message, error: error.cause }, 400)
        }
        return c.json({ success: false, message: 'Something went wrong', error }, 500)
    }
})

serviceRoute.post('/langchain/text', async (c) => {
    try {
        const payload = await c.req.formData();
        const file = payload.get("file") as File
        const text = await extractTextFromDoc(file)
        return c.json({ success: true, message: 'Text extracted successfully', text }, 200)
    } catch (error) {
        if (error instanceof ParsePDFLangchainError || error instanceof ExtractTextFromDocError) {
            return c.json({ success: false, message: error.message, error: error.cause }, 400)
        }
        return c.json({ success: false, message: 'Something went wrong', error }, 500)
    }
})

export default serviceRoute;