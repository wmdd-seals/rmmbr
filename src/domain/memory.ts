import { ID, Location, Maybe } from '#utils'
import { User } from './user'

export abstract class Memory {
    public abstract id: ID<string, 'memory-id'>
    public abstract title: string
    public abstract description: Maybe<string>
    public abstract date: string
    public abstract location: Maybe<Location>
    public abstract ownerId: User['id']
}
