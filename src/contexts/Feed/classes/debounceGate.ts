export const DEBOUNCE_TIME = 1000

export class DebounceGate {
    private lastRequestTime = 0
    constructor(private debounceMs: number = DEBOUNCE_TIME) {}

    canProceed(): boolean {
        const now = Date.now()
        return now - this.lastRequestTime >= this.debounceMs
    }

    mark() {
        this.lastRequestTime = Date.now()
    }
}
