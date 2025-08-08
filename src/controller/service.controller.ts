import * as fs from 'fs'
import * as path from 'path'
import { generateNanoId } from '../utils/nanoid.utils';
import { uploadFileToGCPService } from '../services/gcp.service';
import { ExtractTextFromDocError, UploadFileToGCPError } from '../exceptions/service.exceptions';
import { ActiveConfig } from '../utils/config.utils';
import { parsePDFLangchainService } from '../services/langchain.service';
import { ParsePDFLangchainError } from '../exceptions/langchain.exceptions';

export async function uploadFileToGCP(payload: { file: File }) {
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
        throw new UploadFileToGCPError('Failed to upload file to GCP', { cause: (error as Error).message });
    }
    finally {
        if (filePath) {
            fs.unlinkSync(filePath)
        }
    }
}

export async function extractTextFromDoc(file: File) {
    let filePath = ''
    try {
        const fileArrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(fileArrayBuffer);
        fs.writeFileSync('file.pdf', fileBuffer)
        filePath = path.resolve('file.pdf')
        return await parsePDFLangchainService(filePath)
    } catch (error) {
        if (error instanceof ParsePDFLangchainError) {
            throw error;
        }
        throw new ExtractTextFromDocError('Failed to parse PDF', { cause: (error as Error).message });
    }
    finally {
        if (filePath) {
            fs.unlinkSync(filePath)
        }
    }
}

