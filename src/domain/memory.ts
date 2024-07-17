import { ID, Location, Maybe } from '#utils'
import { User } from './user'

export type MemoryMessage = {
    id: ID<string, 'memory-message-id'>
    message: string
    memoryId: Memory['id']
    userId: User['id']
    userFirstName: string
    createdAt: string
}

export abstract class Memory {
    public abstract id: ID<string, 'memory-id'>
    public abstract title: string
    public abstract description: Maybe<string>
    public abstract date: string
    public abstract location: Maybe<Location>
    public abstract ownerId: User['id']
    public abstract cover: Maybe<string>
    public abstract stickerId: Maybe<string>
    public abstract categories: string[]
}

// FIXME: when we will implement having categories for memories, I will change the type of categories to be an array of numbera(Natsuko)
export type Category = [category?: string, category?: string, category?: string]

export type FilterCriteria = {
    categories: string[]
    startDate: string
    endDate: string
    locations: string[]
    collaborators: string[]
}
