import { expect } from 'vitest'
import { notificationProvider } from '@/test/support/setup-container-mock'

/**
 * Expects the user to receive an error notification
 * @param error The error message in the notification
 */
export const sendsErrorNotification = (error: string): void => {
  expect(notificationProvider.showNotification).toHaveBeenCalledWith(`Error: ${error}`)
}
