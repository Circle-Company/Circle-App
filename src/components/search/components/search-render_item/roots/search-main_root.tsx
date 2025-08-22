import React from "react"
import SearchContext from "../../../search-context"
import { SearchMainRootProps } from "../../../search-types"

export default function main_root({ children, data }: SearchMainRootProps) {
    return <SearchContext.Provider value={{ search: data }}>{children}</SearchContext.Provider>
}
