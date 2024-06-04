import { ID } from '../utils'

export abstract class Memory {
    public abstract id: ID<string, 'memory-id'>
}
