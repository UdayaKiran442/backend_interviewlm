import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { ParsePDFLangchainError } from "../exceptions/langchain.exceptions";

export async function parsePDFLangchainService(filePath: string) {
    try {
        const reader = new PDFLoader(filePath);
        const data = await reader.load();
        return data[0].pageContent;
    } catch (error) {
        throw new ParsePDFLangchainError('Failed to parse PDF', { cause: (error as Error).cause });
    }
}