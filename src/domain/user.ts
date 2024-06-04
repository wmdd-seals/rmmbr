import { ID } from '../utils'

export abstract class User {
    public abstract id: ID<string, 'user-id'>
}
