type DebouncedFunction<T extends (...args: any[]) => any> = (...args: Parameters<T>) => void

export function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): DebouncedFunction<T> {
    let timeoutId: NodeJS.Timeout

    return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
        clearTimeout(timeoutId)

        timeoutId = setTimeout(() => {
            func.apply(this, args)
        }, delay)
    }
}

export function debounceAsync<T extends (...args: any[]) => Promise<any>>(func: T, delay: number) {
    let timeoutId: NodeJS.Timeout

    return async function (this: ThisParameterType<T>, ...args: Parameters<T>): Promise<void> {
        clearTimeout(timeoutId)

        return new Promise((resolve) => {
            timeoutId = setTimeout(async () => {
                await func.apply(this, args)
                resolve()
            }, delay)
        })
    }
}
