import React from "react"
import { View, Text } from "react-native"
import SearchContext from "../../../search-context"
import { SearchMainRootProps } from "../../../search-types"
import sizes from "../../../../../layout/constants/sizes"

export default function main_root ({children, data}: SearchMainRootProps) {

    return (
        <SearchContext.Provider value={{search: data}}>
            {children}
        </SearchContext.Provider>
    )
}