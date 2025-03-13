import { testId } from '@/test/support/utils/html-utils'
import type { VueWrapper } from '@vue/test-utils'

const openFillAndSubmitForm = async (wrapper: VueWrapper, lobbyName: string) => {
  await wrapper.find(lobbyHelpers.createButton).trigger('click')
  await wrapper.find(lobbyHelpers.nameInput).setValue(lobbyName)
  await wrapper.find(lobbyHelpers.createForm).trigger('submit')
}

export const lobbyHelpers = {
  createButton: testId('create-lobby-button'),
  nameInput: testId('lobby-name-input'),
  createForm: testId('lobby-form'),
  card: testId('lobby-card'),
  createModal: testId('lobby-create-modal'),
  openFillAndSubmitForm,
}
