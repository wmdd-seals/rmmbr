import { Collaborator, Memory, User } from '#domain'
import { supabase } from './supabase'
import { ApiTable } from './utils'
import { findExtensionName, PromiseMaybe } from '#utils'
import { storageApi } from './storageApi'
import { Moment } from 'src/domain/moment'
import { v4 as uuidv4 } from 'uuid'

type MemoryColumns = keyof Memory

type CreateMemoryPayload = Pick<Memory, 'ownerId' | 'title' | 'location' | 'date'>

type CollaboratorJoinedUser = Collaborator & {
    users: User
}

export type CreateCollaboratorPayload = Pick<Collaborator, 'memoryId' | 'userId'>

type CreateMomentPayload = Pick<Moment, 'description' | 'mediaPath' | 'memoryId' | 'type'>

type FileEntry = {
    file: Blob | File
    fileName: string
    type: 'image' | 'video'
}

// todo:
type UpdateMemoryPayload = Partial<Pick<Memory, 'title' | 'date' | 'location' | 'cover' | 'stickerId'>>

class MemoryApi {
    private readonly memories = supabase.from(ApiTable.Memories)
    private readonly collaborators = supabase.from(ApiTable.Collaborators)
    private readonly moments = supabase.from(ApiTable.Moments)

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

    public async getAllCollaborators(memoryId: Collaborator['memoryId']): PromiseMaybe<User[]> {
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
        return res.data?.map(d => d.users)
    }

    private async createMoment(createMomentPayload: CreateMomentPayload): PromiseMaybe<Moment[]> {
        const res = await this.moments.insert(createMomentPayload).select<string, Moment>()
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
            mediaPath: null
        })
        return descriptionRes
    }

    public async createVisualMoment(entry: FileEntry, memoryId: Memory['id']): PromiseMaybe<Moment[]> {
        const extensionName = findExtensionName(entry.fileName)
        const path = `memory/${memoryId}/${entry.type}/${uuidv4()}.${extensionName}`

        const uploadFileRes = await storageApi.uploadFile(path, entry.file)
        if (!uploadFileRes.data) return

        const imageVidRes = await this.createMoment({
            type: entry.type,
            description: null,
            memoryId: memoryId,
            mediaPath: uploadFileRes.data.path
        })
        return imageVidRes
    }

    public async getAllMomentsByMemoryId(memoryId: Memory['id']): PromiseMaybe<Moment[]> {
        const res = await this.moments.select<string, Moment>('*').eq<Moment['memoryId']>('memoryId', memoryId)
        if (!res.data) return

        const formatData = res.data.map(item => {
            if (item.type === 'description') return item

            const publicUrl = storageApi.getFileUrl(item.mediaPath!)
            return {
                ...item,
                mediaPath: publicUrl
            }
        })
        return formatData
    }

    public async deleteMoments(momentIds: Moment['id'][]): PromiseMaybe<void> {
        const res = await this.moments
            .delete({ count: 'planned' })
            .in('id' satisfies keyof Moment, momentIds)
            .select<string, Moment>()

        if (!res.data) return

        res.data.forEach(async moment => {
            if (!moment.mediaPath) return
            await storageApi.deleteFile(moment.mediaPath)
        })
    }
}

export const memoryApi = new MemoryApi()
