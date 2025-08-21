import { upsertVectorEmbeddings } from "../utils/upsertVectorDb.utils";

self.onmessage = async (event) => {
	const { indexName, text, metadata } = event.data;

	try {
		await upsertVectorEmbeddings({
			indexName,
			text,
			metadata,
		});
		self.postMessage({ success: true });
	} catch (error) {
		self.postMessage({ success: false, error: (error as Error).message });
	}
};
