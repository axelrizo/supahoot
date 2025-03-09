import type { VueWrapper } from "@vue/test-utils";
import { testId } from "./test-utils";

const fillSecretWordAndSubmit = async (wrapper: VueWrapper, secretWord: string) => {
  wrapper.find(quizHelpers.secretWordInput).setValue(secretWord)
  await wrapper.find(quizHelpers.verifyButton).trigger("click")
}

export const quizHelpers = {
  secretWordInput: testId('secret-word-input'),
  verifyButton: testId('verify-secret-word-button'),
  createQuizButton: testId('create-quiz-button'),
  fillSecretWordAndSubmit
}
