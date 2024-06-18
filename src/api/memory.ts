import { Memory, User } from '#domain'
import { supabase } from './supabase'
import { ApiTable } from './utils'
import { PromiseMaybe } from '#utils'

type MemoryColumns = keyof Memory

type CreateMemoryPayload = Pick<Memory, 'ownerId' | 'title' | 'location' | 'date'>

// todo:
// type UpdateMemoryPayload = {}

class MemoryApi {
    private readonly memories = supabase.from(ApiTable.Memories)
    private readonly editors = supabase.from(ApiTable.Editors)

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

    public async getShared(memoryId: Memory['id'], userId: User['id']): PromiseMaybe<Memory> {
        const res = await this.memories
            .select<string, Memory>(
                `
                    *,
                    editors (
                        *,
                        users (
                            id,
                            firstName,
                            lastName
                        )
                    )
                `
            )
            .eq<Memory['id']>('id' satisfies MemoryColumns, memoryId)
            .eq<User['id']>('editors.userId', userId)
            .neq('ownerId' satisfies MemoryColumns, userId)

        return res.data?.[0]
    }

    public async getAllShared(userId: User['id']): Promise<Memory[]> {
        const res = await this.memories
            .select<string, Memory>(
                `
                    *,
                    editors (
                        *,
                        users (
                            id,
                            firstName,
                            lastName
                        )
                    )
                `,
                { count: 'exact' }
            )
            .eq<Memory['ownerId']>('editors.userId', userId)
            .neq('ownerId', userId)

        return res.data || []
    }

    public async create(payload: CreateMemoryPayload): PromiseMaybe<Memory> {
        const res = await this.memories.insert<CreateMemoryPayload[]>([payload]).select<string, Memory>()

        return res.data?.[0]
    }

    // todo:
    // public async update(payload: UpdateMemoryPayload): Promise<void> {
    //     await this.memories.update()
    // }

    public async shareWith(memoryId: Memory['id'], userIds: Array<User['id']>): Promise<boolean> {
        const res = await Promise.all(userIds.map(id => this.editors.insert([{ memoryId, userId: id }])))

        for (const response of res) {
            if (response.error) {
                return false
            }
        }

        return true
    }

    public async stopSharingWith(memoryId: Memory['id'], userId: User['id']): Promise<boolean> {
        const res = await this.editors.delete().eq('memoryId', memoryId).eq('userId', userId)

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
