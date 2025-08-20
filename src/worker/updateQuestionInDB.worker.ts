import { updateQuestionInDB } from "../repository/question/question.repository";

self.onmessage = async (event) => {
	const { questionId } = event.data;

	try {
		await updateQuestionInDB({
			questionId,
			isDisplayed: true,
		});
		self.postMessage({ success: true });
	} catch (error) {
		self.postMessage({ success: false, error: (error as Error).message });
	}
};
