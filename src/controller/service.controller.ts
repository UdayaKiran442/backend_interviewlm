import * as fs from 'fs'
import * as path from 'path'
import { generateNanoId } from '../utils/nanoid.utils';
import { uploadFileToGCPService } from '../services/gcp.service';
import { UploadFileToGCPError } from '../exceptions/service.exceptions';
import { ActiveConfig } from '../utils/config.utils';

export async function uploadFileToGCP(payload: { file: File, userId: string }) {
    let filePath = ''
    try {
        const fileArrayBuffer = await payload.file.arrayBuffer();
        const fileBuffer = Buffer.from(fileArrayBuffer);
        fs.writeFileSync('file.pdf', fileBuffer)
        filePath = path.resolve('file.pdf')
        const fileName = `${generateNanoId()}.pdf`
        await uploadFileToGCPService({ filePath, fileName })
        return `https://storage.googleapis.com/${ActiveConfig.GCP_BUCKET_NAME}/${fileName}`

    } catch (error) {
        throw new UploadFileToGCPError('Failed to upload file to GCP', { cause: (error as Error).cause });
    }
    finally {
        if (filePath) {
            fs.unlinkSync(filePath)
        }
    }

}
