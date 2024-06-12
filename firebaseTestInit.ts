import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { readFileSync } from 'fs'

let rulesTestEnv: RulesTestEnvironment

export async function initTestEnv(projectId: string) {
    rulesTestEnv = await initializeTestEnvironment({
        projectId: projectId,
        firestore: {
            rules: readFileSync('./firebase.rules', 'utf-8'),
            host: '127.0.0.1',
            port: 8085
        }
    })
}

export const getRulesTestEnv = () => rulesTestEnv
