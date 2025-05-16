import { useMemo } from "react"

export function useDistanceFormatter(distance: number) {
    return useMemo(() => {
        // Garante que o número tenha no máximo 2 casas decimais
        const roundedDistance = Math.round(distance * 10) / 10

        // Formata o número para ter sempre 1 casa decimal
        const formattedDistance = roundedDistance.toFixed(1)

        // Remove o zero à direita se for um número inteiro
        const cleanDistance = formattedDistance.replace(/\.0$/, "")

        return `${cleanDistance} km`
    }, [distance])
}
