import { supabase } from 'src/api/supabase'
import { Path } from './path'

export async function redirectIfSignedIn(): Promise<void> {
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
        return
    }

    // if the user signed in redirect to top page
    window.location.href = Path.home
}
