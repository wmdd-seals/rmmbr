import { ID } from '../utils'

export abstract class User {
    public abstract id: ID<string, 'user-id'>
    public abstract email: string
    public abstract firstName: string
    public abstract lastName: string
}
