// debounceGate.ts
import { DEBOUNCE_TIME } from "@/contexts/Feed/constants"

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
