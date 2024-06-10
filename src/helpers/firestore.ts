import {
    addDoc,
    collection,
    doc,
    DocumentData,
    DocumentReference,
    FirestoreDataConverter,
    getDoc,
    QueryDocumentSnapshot,
    setDoc,
    SnapshotOptions,
    WithFieldValue
} from 'firebase/firestore'
import { firestore } from './firebase'
import { FirebaseError } from 'firebase/app'

type collectionName = 'users' | 'memories' | 'mediaSrcs'

type Converter = {
    [key in collectionName]: () => FirestoreDataConverter<UserAccount | Memory | MediaSrc>
}

type UserAccount = {
    email: string
    firstName: string
    lastName: string
}

type Memory = {
    createdAt: Date | null
    deletedAt: Date | null
    memoryDate: Date
    editorIds: string[] | [] | null
    ownerId: string
    description: string | null
    title: string
    viewerIds: string[] | [] | null
    location: [number, number] | null
}

type MediaSrc = {
    type: 'audio' | 'img' | 'video' | 'text'
    path: string | null
    text: string | null
    createdAt: string
}

const converter = <T>(): FirestoreDataConverter<T, DocumentData> => ({
    toFirestore: (data: WithFieldValue<T>): WithFieldValue<DocumentData> => {
        return { data }
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): T => {
        return snapshot.data(options).value as T
    }
})

const converters: Converter = {
    users: converter<UserAccount>,
    memories: converter<Memory>,
    mediaSrcs: converter<MediaSrc>
}

/**
 * This function is for adding a firestore document(data). Not for updating.
 * - ex.)
 *   - When you add new doc with auto-generated ID call this function like this:
 *     - addSingleDoc('collection1', dataObj)
 *   - When you add new subCollection doc with auto-generated ID then call like this:
 *     - addSingleDoc('collection1', dataObj, 'collection1's ID' 'subCollection')
 */
export const addSingleDoc = async (
    collectionName: collectionName,
    newData: Memory | UserAccount | MediaSrc,
    ...pathSegments: string[] | []
): Promise<DocumentReference | FirebaseError | void> => {
    const converter = converters[collectionName]

    let result
    try {
        // If you want disignate
        if (pathSegments.length > 0 && pathSegments.length % 2 !== 0) {
            const dRef = doc(firestore, collectionName, ...pathSegments).withConverter(converter())
            result = await setDoc(dRef, newData)
        } else {
            const cRef = collection(firestore, collectionName, ...pathSegments).withConverter(converter())
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

/**
 * update a doc in firestore
 */

/**
 * get data from firestore
 */
export const getSingleDoc = async (collectionName: collectionName, keyParam: string): Promise<object | null> => {
    const docRef = doc(firestore, collectionName, keyParam)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
        const data = docSnap.data()
        return data
    } else {
        // nothing fetched
        return null
    }
}
