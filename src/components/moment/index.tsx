import top_root from "./components/roots/top/moment-top_root"
import top_left_root from "./components/roots/top/moment-top_left_root"
import top_right_root from "./components/roots/top/moment-top_right_root"
import center_root from "./components/roots/center/moment-center_root"
import bottom_root from "./components/roots/bottom/moment-bottom_root"
import main_root from "./components/roots/moment-main_root"
import container from "./components/moment-container"
import like from "./components/moment-like"
import description from "./components/moment-description"
import date from "./components/moment-date"
import share from "./components/moment-share"
import more from "./components/moment-more"
export const Moment = {

    Root: {
        Main: main_root,
        Top: top_root,
        TopLeft: top_left_root,
        TopRight: top_right_root,
        Center: center_root,
        Bottom: bottom_root,        
    },
    ShareButton: share,
    MoreButton: more,
    LikeButton: like,
    Container: container,
    Description: description,
    Date: date,

}