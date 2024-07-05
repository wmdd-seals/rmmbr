export function getExtensionName(fileName: string): string {
    const extensionIndex = fileName.lastIndexOf('.')
    return fileName.slice(extensionIndex + 1)
}
