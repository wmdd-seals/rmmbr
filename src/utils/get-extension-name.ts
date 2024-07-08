export function getExtensionName(fileName: string): string | null {
    const extensionIndex = fileName.lastIndexOf('.')
    const extensionName = extensionIndex > 0 ? fileName.slice(extensionIndex + 1) : null
    return extensionName || null
}
