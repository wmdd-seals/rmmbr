import { ID, Location, Maybe } from '#utils'

export abstract class Memory {
    public abstract id: ID<string, 'memory-id'>
    public abstract title: string
    public abstract description: Maybe<string>
    public abstract date: string
    public abstract location: Maybe<Location>
    public abstract viewerIds: string[]
    public abstract editorIds: string[]
    public abstract ownerId: string
}
