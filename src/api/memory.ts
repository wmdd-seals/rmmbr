import { Collaborator, Memory, MemoryMessage, User } from '#domain'
import { supabase } from './supabase'
import { ApiTable } from './utils'
import { PromiseMaybe } from '#utils'
import { storageApi } from './storageApi'
import { Moment } from '#domain'

type MemoryColumns = keyof Memory

type CreateMemoryPayload = Pick<Memory, 'ownerId' | 'title' | 'location' | 'date'>

type CollaboratorJoinedUser = Collaborator & {
    users: User
}

export type CreateCollaboratorPayload = Pick<Collaborator, 'memoryId' | 'userId'>

type MomentPayload = Pick<Moment, 'description' | 'memoryId' | 'type' | 'mediaId'>

type FileEntry = {
    file: Blob | File
    type: 'image' | 'video'
}

type UpdateMemoryPayload = Partial<Pick<Memory, 'title' | 'date' | 'location' | 'cover' | 'description' | 'stickerId'>>

class MemoryApi {
    private readonly memories = supabase.from(ApiTable.Memories)
    private readonly collaborators = supabase.from(ApiTable.Collaborators)
    private readonly moments = supabase.from(ApiTable.Moments)
    private readonly messages = supabase.from(ApiTable.Messages)

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
                `
            )
            .eq<Memory['ownerId']>(`${ApiTable.Collaborators}.userId`, userId)
            .neq('ownerId' satisfies MemoryColumns, userId)

        return res.data || []
    }

    public async create(payload: CreateMemoryPayload): PromiseMaybe<Memory> {
        const res = await this.memories.insert<CreateMemoryPayload[]>([payload]).select<string, Memory>()

        return res.data?.[0]
    }

    public async update(memoryId: Memory['id'], payload: UpdateMemoryPayload): Promise<boolean> {
        const res = await this.memories.update(payload).eq('id' satisfies MemoryColumns, memoryId)
        return !res.error
    }

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

    public async getAllCollaborators(memoryId: Collaborator['memoryId']): Promise<User[]> {
        const res = await this.collaborators
            .select<string, CollaboratorJoinedUser>(
                `
                    *,
                    ${ApiTable.Users} (
                        *
                    )
                `
            )
            .eq<Memory['id']>(`memoryId` satisfies keyof Collaborator, memoryId)

        return res.data?.map(d => d.users) || []
    }

    public async getMessages(memoryId: Memory['id']): Promise<MemoryMessage[]> {
        const res = await this.messages
            .select<
                string,
                Pick<MemoryMessage, 'id' | 'userId' | 'message' | 'memoryId' | 'createdAt'> & {
                    [ApiTable.Users]: { firstName: string }
                }
            >(
                `
                    *, ${ApiTable.Users}(firstName)
                `
            )
            .eq<Memory['id']>('memoryId' satisfies keyof MemoryMessage, memoryId)

        return res.data?.map(m => ({ ...m, userFirstName: m.users.firstName })) || []
    }

    public async sendMessage(memoryId: Memory['id'], userId: User['id'], message: string): Promise<boolean> {
        const res = await this.messages.insert([{ message, memoryId, userId }])

        return !res.error
    }

    public subscribeOnMessages(
        memoryId: Memory['id'],
        onMessage: (message: Pick<MemoryMessage, 'userId' | 'createdAt' | 'message' | 'memoryId' | 'id'>) => void
    ): void {
        supabase
            .channel(memoryId)
            .on<Pick<MemoryMessage, 'userId' | 'createdAt' | 'message' | 'memoryId' | 'id'>>(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: ApiTable.Messages,
                    filter: `memoryId=eq.${memoryId}`
                },
                payload => onMessage(payload.new)
            )
            .subscribe()
    }

    // FIXME: here should not return the non-sense array value
    private async createMoment(MomentPayload: MomentPayload): PromiseMaybe<Moment[]> {
        const res = await this.moments.insert(MomentPayload).select<string, Moment>()
        return res.data
    }

    public async createDescriptionMoment(
        description: Moment['description'],
        memoryId: Memory['id']
    ): PromiseMaybe<Moment[]> {
        const descriptionRes = await this.createMoment({
            type: 'description',
            description: description,
            memoryId: memoryId,
            mediaId: null
        })
        return descriptionRes
    }

    public async createMediaMoment(entry: FileEntry, memoryId: Memory['id']): PromiseMaybe<Moment> {
        const momentRes = await this.createMoment({
            type: entry.type,
            description: null,
            memoryId: memoryId,
            mediaId: null
        })
        if (!momentRes) return

        const path = this.generateMomentMediaPath(momentRes[0])
        const uploadFileRes = await storageApi.uploadFile(path, entry.file).then(async res => {
            await this.updateMoment(momentRes[0].id, { mediaId: res.data?.id })
            return res
        })
        if (!uploadFileRes.data) return

        return momentRes[0]
    }

    public async getAllMomentsByMemoryId(memoryId: Memory['id']): PromiseMaybe<Moment[]> {
        const res = await this.moments.select<string, Moment>('*').eq<Moment['memoryId']>('memoryId', memoryId)
        if (!res.data) return

        return res.data
    }

    // FIXME: update method not working correctly
    public async updateMoment(momentId: Moment['id'], payload: Partial<MomentPayload>): Promise<boolean> {
        const res = await this.moments.update(payload).eq('id' satisfies keyof Moment, momentId)
        return !res.error
    }

    public async deleteMoments(momentIds: Moment['id'][]): PromiseMaybe<void> {
        const res = await this.moments
            .delete({ count: 'planned' })
            .in('id' satisfies keyof Moment, momentIds)
            .select<string, Moment>()

        if (!res.data) return

        res.data.forEach(async moment => {
            if (moment.type === 'description') return
            await storageApi.deleteFile(this.generateMomentMediaPath(moment))
        })
    }

    public generateMomentMediaPath(moment: Moment): string {
        return `memory/${moment.memoryId}/${moment.id}`
    }
}

export const memoryApi = new MemoryApi()
