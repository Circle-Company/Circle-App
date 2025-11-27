import { act, render, waitFor } from "@testing-library/react-native"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Animated } from "react-native"
import MediaRenderVideo from "../midia_render-video"
import React from "react"

let lastVideoProps: any = null
const seekMock = vi.fn()

vi.mock("react-native-video", () => {
    const React = require("react")
    const { View } = require("react-native")

    const Component = React.forwardRef((props: any, ref: any) => {
        lastVideoProps = props
        React.useImperativeHandle(ref, () => ({
            seek: seekMock,
        }))
        return React.createElement(View, { testID: "mock-video" })
    })

    return {
        __esModule: true,
        default: Component,
        __getLastVideoProps: () => lastVideoProps,
        __seekMock: seekMock,
    }
})

const getLastVideoProps = () => lastVideoProps

describe("MediaRenderVideo", () => {
    let timingSpy: ReturnType<typeof vi.spyOn>
    let parallelSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
        lastVideoProps = null
        seekMock.mockClear()

        timingSpy = vi.spyOn(Animated, "timing").mockImplementation((value: any, config: any) => {
            return {
                start: (callback?: (result: { finished: boolean }) => void) => {
                    if (typeof config.toValue === "number") {
                        value.setValue(config.toValue)
                    }
                    callback?.({ finished: true })
                },
                stop: vi.fn(),
            } as any
        })

        parallelSpy = vi.spyOn(Animated, "parallel").mockImplementation((animations: any[]) => {
            return {
                start: (callback?: (result: { finished: boolean }) => void) => {
                    animations.forEach((animation) => {
                        if (animation?.start) {
                            animation.start()
                        }
                    })
                    callback?.({ finished: true })
                },
                stop: vi.fn(),
            } as any
        })
    })

    afterEach(() => {
        timingSpy.mockRestore()
        parallelSpy.mockRestore()
    })

    const baseProps = {
        uri: "https://cdn.test/video.mp4",
        thumbnailUri: "https://cdn.test/thumb.jpg",
        hasVideoCache: true,
        momentId: "moment-test",
    }

    it("inicia reprodução imediatamente após carregamento quando está focado", async () => {
        const { rerender } = render(<MediaRenderVideo {...baseProps} isFocused />)

        expect(getLastVideoProps()).not.toBeNull()

        await act(async () => {
            getLastVideoProps().onLoad({ duration: 5 } as any)
        })

        await waitFor(() => {
            expect(getLastVideoProps().paused).toBe(false)
        })

        const durations = timingSpy.mock.calls.map(([, config]) => config?.duration)
        expect(durations).toContain(160)

        rerender(<MediaRenderVideo {...baseProps} isFocused={false} />)

        await waitFor(() => {
            expect(getLastVideoProps().paused).toBe(true)
        })

        expect(seekMock).toHaveBeenCalledWith(0)
    })

    it("retoma reprodução ao ganhar foco após carregado", async () => {
        const { rerender } = render(<MediaRenderVideo {...baseProps} isFocused={false} />)

        expect(getLastVideoProps().paused).toBe(true)

        await act(async () => {
            getLastVideoProps().onLoad({ duration: 12 } as any)
        })

        expect(getLastVideoProps().paused).toBe(true)

        rerender(<MediaRenderVideo {...baseProps} isFocused />)

        await waitFor(() => {
            expect(getLastVideoProps().paused).toBe(false)
        })
        expect(seekMock).toHaveBeenCalled()
    })
})
