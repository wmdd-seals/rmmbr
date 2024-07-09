import { ID, Maybe } from '#utils'
import { Memory } from './memory'

export abstract class Moment {
    public abstract id: ID<string, 'moment-id'>
    public abstract type: 'description' | 'image' | 'video'
    public abstract description: Maybe<string>
    public abstract memoryId: Memory['id']
    public abstract mediaId: Maybe<string>
    public abstract createdAt: Maybe<Date>
}
