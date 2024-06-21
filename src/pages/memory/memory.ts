import { authStateGuard } from 'src/utils/authStateGuard'

window.addEventListener('DOMContentLoaded', () => authStateGuard())

const urlParams = new URLSearchParams(location.search)
console.log('id: ', urlParams.get('id'))
