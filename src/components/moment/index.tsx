import top_root from "./components/roots/top/moment-top_root"
import top_left_root from "./components/roots/top/moment-top_left_root"
import top_right_root from "./components/roots/top/moment-top_right_root"
import center_root from "./components/roots/center/moment-center_root"
import bottom_root from "./components/roots/bottom/moment-bottom_root"
import main_root from "./components/roots/moment-main_root"
import container from "./components/moment-container"
import like from "./components/moment-like"
import description from "./components/moment-description"

export const Moment = {
    TopRoot: top_root,
    MainRoot: main_root,
    TopLeftRoot: top_left_root,
    TopRightRoot: top_right_root,
    CenterRoot: center_root,
    BottomRoot: bottom_root,
    Container: container,
    LikeButton: like,
    Description: description
}