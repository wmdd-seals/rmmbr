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
    private readonly storage = supabase.storage.from('rmmbr')

    public uploadFile(filePath: string, file: Blob): Promise<StorageFilePromise> {
        return this.storage.upload(filePath, file)
    }

    public overwriteFile(filePath: string, file: Blob): Promise<StorageFilePromise> {
        return this.storage.upload(filePath, file, { upsert: true })
    }

    public getFileUrl(filePath: string): string | null {
        const { data } = this.storage.getPublicUrl(filePath)
        return data.publicUrl
    }

    public async deleteFile(filePath: string): Promise<boolean> {
        const res = await this.storage.remove([filePath])
        return !res.error
    }
}

export const storageApi = new StorageApi()
