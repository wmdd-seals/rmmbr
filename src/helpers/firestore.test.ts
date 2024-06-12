import { it, expect, describe, beforeEach, vi } from 'vitest'
import { getFirestore, getTestEnv, setupTest } from '../../firebase/tests/test-setup'
import * as testing from '@firebase/rules-unit-testing'
import { v4 as uuidv4 } from 'uuid'

import { collection, addDoc, doc, DocumentReference, setDoc } from 'firebase/firestore'
import { FirebaseError } from 'firebase/app'
import { UserAccount, Memory, collectionName, MediaSrc, converters } from './firestore'

const firebaseModules = vi.hoisted(() =>
    vi.fn(() => ({
        auth: vi.fn()
    }))
)
vi.mock('./firebase.ts', () => ({
    firebaseModules
}))

// ----The below is basically copy & past from firestore.ts----
// to fix: I tried to mock the doc reference with initialized firestore instance with vi.mock but it did not work. so here are the temporary workaround for it.
const addSingleDoc = async (
    collectionName: collectionName,
    newData: Memory | UserAccount | MediaSrc,
    ...pathSegments: string[] | []
): Promise<DocumentReference | FirebaseError | void> => {
    const converter = converters[collectionName]

    let result
    try {
        // If you want disignate
        if (pathSegments.length > 0 && pathSegments.length % 2 !== 0) {
            const dRef = doc(firestoreInit.firestore(), collectionName, ...pathSegments).withConverter(converter())
            result = await setDoc(dRef, newData)
        } else {
            const cRef = collection(firestoreInit.firestore(), collectionName, ...pathSegments).withConverter(
                converter()
            )
            result = await addDoc(cRef, newData)
        }
    } catch (err) {
        if (err instanceof FirebaseError) {
            console.log(err)
            result = err
        }
    }

    return result
}

// ----The above is basically copy & past from firestore.ts----

// ---Tests are below----

setupTest('rmmbr-seals')

let firestoreInit: testing.RulesTestContext
const userId = uuidv4()
const userData = {
    userId: userId,
    firstName: 'Tomoki',
    lastName: 'Kaneko',
    email: 'aaaaa@gmail.com'
}

const newDocObj = {
    createdAt: new Date(),
    deletedAt: null,
    memoryDate: new Date('2024-07-07'),
    editorIds: [],
    ownerId: userId,
    description: `description sample`,
    title: 'Title sample',
    viewerIds: [],
    location: null
}

const collectionId = 'users'

describe('firestore.ts', () => {
    beforeEach(async () => {
        await getTestEnv().withSecurityRulesDisabled(context => {
            return context.firestore().collection(collectionId).doc(userId).set(userData)
        })
        firestoreInit = getFirestore({ uid: userId })
    })

    // addSingleDoc: Fail
    it('ensure addSingleDoc throws an error because the mock user is not authenticated', async () => {
        firestoreInit = getFirestore()

        const res = await addSingleDoc('memories', newDocObj)
        expect((res as FirebaseError).code).toBeTruthy()
    })

    // addSingleDoc: Success
    it('ensure addSingleDoc successfully add an data and gets the reference id', async () => {
        firestoreInit = getFirestore({ uid: userId })

        const res = await addSingleDoc('memories', newDocObj)
        expect((res as DocumentReference).id).toBeTruthy()
    })
})
