import { supabase } from 'src/api/supabase'
import { PagePath } from '../utils/pagePath'

function authStateGuard(): void {
    supabase.auth.onAuthStateChange((_, session) => {
        if (!session?.user) {
            window.location.href = PagePath.SignIn
            return
        }
    })
}

authStateGuard()
