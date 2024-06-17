import { supabase } from '../helpers/supabase'

type StorageFilePromise =
    | {
          data: { path: string }
          error: null
      }
    | {
          data: null
          error: Error
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
