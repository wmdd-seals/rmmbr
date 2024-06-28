import { supabase } from './supabase'

export type StorageFilePromise =
    | {
          data: { path: string }
          error: null
      }
    | {
          data: null
          error: Error // Here is because the interface of this error expresses same structure as Error instance in the supabase module.
      }

/**
 * Storage API for fetching/uploading/overwriting media files
 */
class StorageApi {
    public uploadFile(filePath: string, file: Blob): Promise<StorageFilePromise> {
        return supabase.storage.from('user-avatar').upload(filePath, file)
    }

    public overwriteFile(filePath: string, file: Blob): Promise<StorageFilePromise> {
        return supabase.storage.from('user-avatar').upload(filePath, file, { upsert: true })
    }

    public getFileUrl(filePath: string): string | null {
        const { data } = supabase.storage.from('user-avatar').getPublicUrl(filePath)
        return data.publicUrl
    }

    public async deleteFile(filePath: string): Promise<boolean> {
        const res = await supabase.storage.from('user-avatar').remove([filePath])
        return !res.error
    }
}

export const storageApi = new StorageApi()
