import { Hono } from "hono";
import { uploadFileToGCP } from "../../controller/service.controller";
import { UploadFileToGCPError } from "../../exceptions/service.exceptions";
import { UploadFileToGCPServiceError } from "../../exceptions/gcp.exceptions";

const serviceRoute = new Hono();

serviceRoute.post('/gcp/upload', async (c) => {
    try {
        const payload = await c.req.formData();
        const file = payload.get("file") as File
        const res = await uploadFileToGCP({ file, userId: "user_2zwlEvqNUWCY8Q2Tgz9UsX5P8XE" })
        return c.json({ success: true, message: 'File uploaded successfully', res }, 200)
    } catch (error) {
        if (error instanceof UploadFileToGCPError || error instanceof UploadFileToGCPServiceError) {
            return c.json({ success: false, message: error.message, error: error.cause }, 400)
        }
        return c.json({ success: false, message: 'Something went wrong', error }, 500)
    }
})

export default serviceRoute;