import { addDoc, collection, doc, getDoc } from 'firebase/firestore'
import { firestore } from './firebase'

type MediaSrc = {
    type: 'audio' | 'img' | 'video' | 'text'
    path: string
    createdAt: string
}

type collectionName = 'users' | 'memories' | 'mediaSrcs'

type MemoryDocObj = {
    createdAt: Date | null
    deletedAt: Date | null
    memoryDate: Date
    editorIds: string[] | [] | null
    ownerId: string
    description: string | null
    title: string
    viewerIds: string[] | [] | null
    location: [number, number] | null
    mediaSrcs: string[] // reference IDs for mediaSrcs subCollection
}

/**
 * This function is for adding a firestore document(data). Not for updating.
 * @param collectionName You can refer collection names from firebase admin page (https://console.firebase.google.com/u/0/project/rmmbr-seals/firestore/databases/-default-/data/~2Fmemories~2FOk9q257ztt0lC9OqISYX)
 * @param dataObj This data object structure must be equivalent to the document of the collection you want to manipulate
 */
export const addSingleDoc = async (collectionName: string, dataObj: MemoryDocObj): Promise<void> => {
    let result
    const docRef = collection(firestore, collectionName)
    await addDoc(docRef, dataObj)
        .then(res => {
            const dataReferences = {
                collectionName: res.parent.type,
                docId: res.id
            }
            result = dataReferences
        })
        .catch(err => {
            console.log(err)
            result = err
        })
    return result
}

/**
 * This function is for getting data from firestore
 * @param collectionName　You can refer collection names from firebase admin page (https://console.firebase.google.com/u/0/project/rmmbr-seals/firestore/databases/-default-/data/~2Fmemories~2FOk9q257ztt0lC9OqISYX)
 * @param keyParam
 * @returns
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
