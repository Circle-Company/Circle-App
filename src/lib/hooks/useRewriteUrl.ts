import React from "react"
import config from "@/config"

/**
 * Parses an endpoint string and returns a normalized origin and host.
 * - Ensures protocol is present
 * - Normalizes trailing slash
 */
function parseEndpoint(endpoint: string) {
    try {
        const ep = String(endpoint || "").trim()
        const hasProtocol = /^https?:\/\//i.test(ep)
        const url = new URL(hasProtocol ? ep : `http://${ep}`)
        // origin = protocol + '//' + host (host includes port if any)
        const origin = `${url.protocol}//${url.host}`
        const host = url.host
        return { origin, host }
    } catch {
        // Fallback to raw string
        const ep = String(endpoint || "").trim().replace(/\/+$/, "")
        return {
            origin: ep || "",
            host: ep.replace(/^https?:\/\//i, "").replace(/\/+.*$/, ""),
        }
    }
}

export type UseRewriteUrlOptions = {
    /**
     * A list of known old hosts that should be rewritten to the current ENDPOINT.
     * Example: ["10.15.0.235:3000", "10.168.15.17:3000", "172.31.80.1:3000"]
     */
    oldHosts?: string[]
    /**
     * When true, if a URL is protocol-relative or missing protocol but absolute host/path,
     * it will be normalized using the current endpoint protocol.
     * Default: true
     */
    normalizeProtocol?: boolean
}

/**
 * Hook that returns a function to rewrite media URLs to the current API ENDPOINT.
 *
 * Behavior:
 * - If the URL is relative (starts with "/"), it prefixes with the current endpoint origin.
 * - If the URL is absolute with http/https:
 *   - If its host matches a known list of old hosts or the current endpoint host, it is rewritten to the current endpoint origin.
 *   - Otherwise, it is returned as is.
 * - Any falsy input is returned as-is.
 *
 * The goal is to make sure media/thumbnails pointing to old LAN hosts or previous endpoints are routed
 * to the currently configured API host.
 */
export function useRewriteUrl(options?: UseRewriteUrlOptions) {
    const { origin: endpointOrigin, host: endpointHost } = React.useMemo(
        () => parseEndpoint((config as any)?.ENDPOINT || ""),
        [(config as any)?.ENDPOINT],
    )

    const oldHosts = React.useMemo<string[]>(
        () =>
            (options?.oldHosts && options.oldHosts.length > 0
                ? options.oldHosts
                : ["10.15.0.235:3000", "10.168.15.17:3000", "172.31.80.1:3000"]
            ).concat(endpointHost ? [endpointHost] : []),
        [options?.oldHosts, endpointHost],
    )

    const normalizeProtocol = options?.normalizeProtocol ?? true

    const rewrite = React.useCallback(
        (urlInput?: string | null): string => {
            if (!urlInput) return urlInput as any
            const original = String(urlInput).trim()
            if (!original) return original

            // Relative path -> prefix with endpoint origin
            if (original.startsWith("/")) {
                const base = endpointOrigin.replace(/\/+$/, "")
                return `${base}${original}`
            }

            // Absolute http(s) URL
            const httpMatch = original.match(/^https?:\/\//i)
            if (httpMatch) {
                try {
                    const u = new URL(original)
                    const isOldHost = oldHosts.includes(u.host)
                    if (isOldHost) {
                        const base = endpointOrigin.replace(/\/+$/, "")
                        const path = `${u.pathname || "/"}${u.search || ""}${u.hash || ""}`
                        return `${base}${path}`
                    }
                    return original
                } catch {
                    // Fall through to return original
                    return original
                }
            }

            // Protocol-relative or bare host path (e.g., //host/path or host/path)
            if (normalizeProtocol) {
                // //host/path
                if (original.startsWith("//")) {
                    try {
                        const u = new URL(`http:${original}`)
                        const isOldHost = oldHosts.includes(u.host)
                        if (isOldHost) {
                            const base = endpointOrigin.replace(/\/+$/, "")
                            const path = `${u.pathname || "/"}${u.search || ""}${u.hash || ""}`
                            return `${base}${path}`
                        }
                        return original
                    } catch {
                        return original
                    }
                }

                // host/path without protocol
                try {
                    // Attempt parse by prepending a protocol
                    const u = new URL(`http://${original}`)
                    const isOldHost = oldHosts.includes(u.host)
                    if (isOldHost) {
                        const base = endpointOrigin.replace(/\/+$/, "")
                        const path = `${u.pathname || "/"}${u.search || ""}${u.hash || ""}`
                        return `${base}${path}`
                    }
                    return original
                } catch {
                    return original
                }
            }

            return original
        },
        [endpointOrigin, oldHosts, normalizeProtocol],
    )

    const rewriteAll = React.useCallback(
        (urls: Array<string | null | undefined>): string[] => urls.map((u) => rewrite(u || "")),
        [rewrite],
    )

    return { rewrite, rewriteAll, endpointOrigin, endpointHost }
}

export default useRewriteUrl
