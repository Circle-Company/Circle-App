import React from "react"
import { storage, storageKeys, safeSet, safeDelete } from "@/store"

type FeedTutorialStep = 0 | 1

type TutorialState = {
    feed: {
        step1Seen: boolean
        step2Seen: boolean
    }
    dismissed: boolean
}

export type TutorialContextValue = {
    state: TutorialState
    // Derived
    shouldShowFeedTutorial: boolean
    nextFeedStep: FeedTutorialStep | null
    // Actions
    markFeedStepSeen: (step: FeedTutorialStep) => void
    dismissTutorials: () => void
    resetFeedTutorial: () => void
}

const TutorialContext = React.createContext<TutorialContextValue | undefined>(undefined)

function readInitialState(): TutorialState {
    const keys = storageKeys().tutorial
    const step1Seen = !!storage.getBoolean(keys.feed.step1Seen)
    const step2Seen = !!storage.getBoolean(keys.feed.step2Seen)
    const dismissed = !!storage.getBoolean(keys.dismissed)
    return {
        feed: { step1Seen, step2Seen },
        dismissed,
    }
}

export function TutorialProvider({ children }: { children: React.ReactNode }) {
    const keysRef = React.useRef(storageKeys().tutorial)
    const [state, setState] = React.useState<TutorialState>(() => readInitialState())

    // On app start (mount), re-read persisted state to avoid re-showing seen cards
    React.useEffect(() => {
        const fresh = readInitialState()
        setState(fresh)
    }, [])

    const markFeedStepSeen = React.useCallback((step: FeedTutorialStep) => {
        setState((prev) => {
            const next =
                step === 0
                    ? { ...prev, feed: { ...prev.feed, step1Seen: true } }
                    : { ...prev, feed: { ...prev.feed, step2Seen: true } }

            // Persist
            try {
                const k = keysRef.current.feed
                if (step === 0) {
                    safeSet(k.step1Seen, true)
                } else {
                    safeSet(k.step2Seen, true)
                }
            } catch {
                // noop
            }

            return next
        })
    }, [])

    const dismissTutorials = React.useCallback(() => {
        setState((prev) => {
            const next = { ...prev, dismissed: true }
            try {
                safeSet(keysRef.current.dismissed, true)
            } catch {
                // noop
            }
            return next
        })
    }, [])

    const resetFeedTutorial = React.useCallback(() => {
        setState((prev) => {
            const next = { ...prev, feed: { step1Seen: false, step2Seen: false } }
            try {
                const k = keysRef.current.feed
                safeDelete(k.step1Seen)
                safeDelete(k.step2Seen)
            } catch {
                // noop
            }
            return next
        })
    }, [])

    // Derived values
    const shouldShowFeedTutorial = React.useMemo(() => {
        if (state.dismissed) return false
        // Show if at least one step is not seen yet
        return !(state.feed.step1Seen && state.feed.step2Seen)
    }, [state.dismissed, state.feed.step1Seen, state.feed.step2Seen])

    const nextFeedStep: FeedTutorialStep | null = React.useMemo(() => {
        if (state.feed.step1Seen && state.feed.step2Seen) return null
        if (!state.feed.step1Seen) return 0
        if (!state.feed.step2Seen) return 1
        return null
    }, [state.feed.step1Seen, state.feed.step2Seen])

    const value = React.useMemo<TutorialContextValue>(
        () => ({
            state,
            shouldShowFeedTutorial,
            nextFeedStep,
            markFeedStepSeen,
            dismissTutorials,
            resetFeedTutorial,
        }),
        [
            state,
            shouldShowFeedTutorial,
            nextFeedStep,
            markFeedStepSeen,
            dismissTutorials,
            resetFeedTutorial,
        ],
    )

    return <TutorialContext.Provider value={value}>{children}</TutorialContext.Provider>
}

export function useTutorial() {
    const ctx = React.useContext(TutorialContext)
    if (!ctx) {
        throw new Error("useTutorial must be used within a TutorialProvider")
    }
    return ctx
}

export default TutorialContext
