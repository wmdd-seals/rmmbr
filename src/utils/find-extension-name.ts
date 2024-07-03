export function findExtensionName(fileName: string): string {
    const extensionIndex = fileName.lastIndexOf('.')
    return fileName.slice(extensionIndex + 1)
}
