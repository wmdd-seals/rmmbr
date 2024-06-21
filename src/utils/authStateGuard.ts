import { supabase } from 'src/api/supabase'
import { Path } from './path'

export function authStateGuard(): void {
    supabase.auth.onAuthStateChange((_, session) => {
        if (!session?.user) {
            window.location.href = Path.signIn
            return
        }
    })
}
