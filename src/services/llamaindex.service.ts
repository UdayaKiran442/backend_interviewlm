import { LlamaParseReader } from "llamaindex";
import { ActiveConfig } from "../utils/config.utils";
import { ParsePDFError } from "../exceptions/llamaindex.exceptions";

export async function parsePDF(filePath: string): Promise<string> {
    try {
        const reader = new LlamaParseReader({
            apiKey: ActiveConfig.LLAMAINDEX_API,
            resultType: "markdown",
        });
        const data = await reader.loadData(filePath);
        return data[0].text;
    } catch (error) {
        throw new ParsePDFError("Failed to parse PDF", {
            cause: (error as Error).message,
        });
    }
}