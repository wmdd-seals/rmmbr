import { supabase } from './supabase'

type StorageFilePromise =
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
        return supabase.storage.from('rmmbr').upload(filePath, file)
    }

    public overwriteFile(filePath: string, file: Blob): Promise<StorageFilePromise> {
        return supabase.storage.from('rmmbr').upload(filePath, file, {
            upsert: true
        })
    }

    public getFileUrl(filePath: string): string | null {
        const { data } = supabase.storage.from('rmmbr').getPublicUrl(filePath)
        return data?.publicUrl
    }
}

export const storageApi = new StorageApi()
