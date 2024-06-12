import { afterAll, beforeAll } from 'vitest'
import { getRulesTestEnv, initTestEnv } from './firebaseTestInit'
import { TokenOptions } from '@firebase/rules-unit-testing'

export const setupTest = (projectId: string) => {
    beforeAll(() => initTestEnv(projectId))
    afterAll(() => getRulesTestEnv().cleanup())
}

export const getFirestore = (authUser?: { uid: string; token?: TokenOptions }) =>
    authUser
        ? getRulesTestEnv().authenticatedContext(authUser.uid, authUser.token)
        : getRulesTestEnv().unauthenticatedContext()

export const getTestEnv = () => getRulesTestEnv()
