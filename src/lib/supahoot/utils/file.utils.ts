export const FileUtils = {
  /**
   * Get a File object and return DataURL to be used in img src
   */
  fileToDataURL(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()

      reader.onloadend = (_e) => resolve(reader.result as string)
      reader.onerror = (_e) => reject(reader.error)
      reader.onabort = (_e) => reject(new Error('Read aborted'))

      reader.readAsDataURL(file)
    })
  },
}
