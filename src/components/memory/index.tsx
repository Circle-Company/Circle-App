import main_root from "./components/roots/memory-main_root"
import container from "./components/memory-container"
import center_root from "./components/roots/center/memory-center_root"
import top_root from "./components/roots/top/memory-top_root"
import top_left_root from "./components/roots/top/memory-top_left_root"
import top_right_root from "./components/roots/top/memory-top_right_root"

import header from "./components/header/memory-header"
import header_left from "./components/header/memory-header_left"
import header_right from "./components/header/memory-header_right"

import title from "./components/memory-title"

export const Memory = {
    TopRoot: top_root,
    MainRoot: main_root,
    TopLeftRoot: top_left_root,
    TopRightRoot: top_right_root,
    CenterRoot: center_root,
    Container: container,
    Header: header,
    HeaderLeft: header_left,
    HeaderRight: header_right,
    Title: title,
}
