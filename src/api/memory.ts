import { Memory, User } from '#domain'
import { supabase } from './supabase'
import { ApiTable } from './utils'
import { PromiseMaybe } from '#utils'
import { storageApi } from './storageApi'

type MemoryColumns = keyof Memory

type CreateMemoryPayload = Pick<Memory, 'ownerId' | 'title' | 'location' | 'date'>

// todo:
// type UpdateMemoryPayload = {}

class MemoryApi {
    private readonly memories = supabase.from(ApiTable.Memories)
    private readonly collaborators = supabase.from(ApiTable.Collaborators)

    public async get(memoryId: Memory['id'], userId: User['id']): PromiseMaybe<Memory> {
        const res = await this.memories
            .select<'*', Memory>('*')
            .eq<Memory['id']>('id' satisfies MemoryColumns, memoryId)
            .eq<Memory['ownerId']>('ownerId' satisfies MemoryColumns, userId)

        return res.data?.[0]
    }

    public async getAll(userId: User['id']): Promise<Memory[]> {
        const res = await this.memories
            .select<'*', Memory>('*')
            .eq<Memory['ownerId']>('ownerId' satisfies MemoryColumns, userId)

        return res.data || []
    }

    public async uploadCover(memoryId: Memory['id'], cover: File): Promise<boolean> {
        const res = await storageApi.overwriteFile(`memory/${memoryId}/cover`, cover)

        return !res.error
    }

    public deleteCover(memoryId: Memory['id']): Promise<boolean> {
        return storageApi.deleteFile(`memory/${memoryId}/cover`)
    }

    public async getShared(memoryId: Memory['id'], userId: User['id']): PromiseMaybe<Memory> {
        const res = await this.memories
            .select<string, Memory>(
                `
                    *,
                    ${ApiTable.Collaborators} (
                        *,
                        ${ApiTable.Users} (
                            id,
                            firstName,
                            lastName
                        )
                    )
                `
            )
            .eq<Memory['id']>('id' satisfies MemoryColumns, memoryId)
            .eq<User['id']>(`${ApiTable.Collaborators}.userId`, userId)
            .neq('ownerId' satisfies MemoryColumns, userId)

        return res.data?.[0]
    }

    public async getAllShared(userId: User['id']): Promise<Memory[]> {
        const res = await this.memories
            .select<string, Memory>(
                `
                    *,
                    ${ApiTable.Collaborators} (
                        *,
                        ${ApiTable.Users} (
                            id,
                            firstName,
                            lastName
                        )
                    )
                `,
                { count: 'exact' }
            )
            .eq<Memory['ownerId']>(`${ApiTable.Collaborators}.userId`, userId)
            .neq('ownerId' satisfies MemoryColumns, userId)

        return res.data || []
    }

    public async create(payload: CreateMemoryPayload): PromiseMaybe<Memory> {
        const res = await this.memories.insert<CreateMemoryPayload[]>([payload]).select<string, Memory>()

        return res.data?.[0]
    }

    // todo:
    // public async update(payload: UpdateMemoryPayload): Promise<void> {
    //     const res = await this.memories.update().eq()
    // }

    public async shareWith(memoryId: Memory['id'], userIds: Array<User['id']>): Promise<boolean> {
        const res = await Promise.all(userIds.map(id => this.collaborators.insert([{ memoryId, userId: id }])))

        for (const response of res) {
            if (response.error) {
                return false
            }
        }

        return true
    }

    public async stopSharingWith(memoryId: Memory['id'], userId: User['id']): Promise<boolean> {
        const res = await this.collaborators.delete().eq('memoryId', memoryId).eq('userId', userId)

        return !!res.error
    }

    public async delete(id: Memory['id'], userId: Memory['ownerId']): Promise<boolean> {
        const res = await this.memories
            .delete()
            .eq('id' satisfies MemoryColumns, id)
            .eq('ownerId' satisfies MemoryColumns, userId)

        return !!res.error
    }
}

export const memoryApi = new MemoryApi()
