import { supabase } from '../helpers/supabase'

/**
 * Storage API for fetching/uploading/overwriting media files
 */
class StorageApi {
    public async uploadFile(filePath: string, file: Blob): Promise<void> {
        await supabase.storage.from('rmmbr').upload(filePath, file)
    }

    public async overwriteFile(filePath: string, file: Blob): Promise<void> {
        await supabase.storage.from('rmmbr').upload(filePath, file, {
            upsert: true
        })
    }

    public getFileUrl(filePath: string): string | null {
        const { data } = supabase.storage.from('rmmbr').getPublicUrl(filePath)
        return data?.publicUrl
    }
}

export const storageApi = new StorageApi()
