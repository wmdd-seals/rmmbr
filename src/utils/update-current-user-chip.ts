import { User } from '#domain'
import { q } from './query'

export function updateCurrentUserChip(user: User): void {
    const currentUserChip = q('#current-user-chip')

    q('[data-user=initials]', currentUserChip).innerHTML = user.firstName.slice(0, 1)

    const avatar = q<HTMLImageElement>('[data-user=avatar]', currentUserChip)
    avatar.src = user.avatarSrc || ''
    avatar.onload = (): void => void avatar.classList.toggle('hidden')
}
