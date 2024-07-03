import { ID } from '#utils'
import { Memory } from './memory'
import { User } from './user'

export abstract class Collaborator {
    public abstract id: ID<string, 'collaborator-id'>
    public abstract userId: User['id']
    public abstract memoryId: Memory['id']
}
