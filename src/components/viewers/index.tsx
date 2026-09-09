import main_root from "./components/roots/viewers-main_root"
import top_root from "./components/roots/top/viewers-top_root"
import top_left_root from "./components/roots/top/viewers-top_left_root"
import top_right_root from "./components/roots/top/viewers-top_right_root"
import center_root from "./components/roots/center/viewers-center_root"
import container from "./components/viewers-container"
import header_left from "./components/headers/viewers-header_left"
import list_viewers from "./components/viewers-list_viewers"
import render_viewer from "./components/viewers-render_viewer"
import stats from "./components/viewers-stats"
import zero_viewers from "./components/viewers-zero_viewers"

export const Viewers = {
    MainRoot: main_root,
    TopRoot: top_root,
    TopLeftRoot: top_left_root,
    TopRightRoot: top_right_root,
    CenterRoot: center_root,
    Container: container,
    HeaderLeft: header_left,
    ListViewers: list_viewers,
    RenderViewer: render_viewer,
    Stats: stats,
    ZeroViewers: zero_viewers,
}
