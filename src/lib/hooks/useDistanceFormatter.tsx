import { useMemo } from "react"

export function useDistanceFormatter(distance: number) {
    return useMemo(() => {
        // Se a distância for maior que 99, não mostra casas decimais
        if (distance >= 100) {
            return `${Math.round(distance)} km`
        }

        // Se a distância for maior que 9, mostra apenas 1 casa decimal
        if (distance >= 10) {
            return `${Math.round(distance * 10) / 10} km`
        }

        // Para distâncias menores que 10, mantém 1 casa decimal e remove zero à direita
        const roundedDistance = Math.round(distance * 10) / 10
        const formattedDistance = roundedDistance.toFixed(1)
        const cleanDistance = formattedDistance.replace(/\.0$/, "")

        return `${cleanDistance} km`
    }, [distance])
}
