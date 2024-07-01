export function q<K extends keyof HTMLElementTagNameMap>(selectors: K, target?: HTMLElement): HTMLElementTagNameMap[K]
export function q<E extends HTMLElement = HTMLElement>(selectors: string, target?: HTMLElement): E
export function q<K extends keyof HTMLElementTagNameMap>(selector: K, target?: HTMLElement): HTMLElementTagNameMap[K] {
    // omit null as we only use this function when we're sure there's an element
    return (target || document).querySelector(selector)!
}
