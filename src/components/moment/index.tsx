import audio_control from "./components/moment-audio_control"
import bottom_root from "./components/roots/bottom/moment-bottom_root"
import center_root from "./components/roots/center/moment-center_root"
import comments from "./components/moment-full-comments"
import container from "./components/moment-container"
import date from "./components/moment-date"
import description from "./components/moment-description"
import like from "./components/moment-like"
import main_root from "./components/roots/moment-main_root"
import more from "./components/moment-more"
import options from "./components/moment-options"
import share from "./components/moment-share"
import shares from "./components/moment-full-shares"
import top_left_root from "./components/roots/top/moment-top_left_root"
import top_right_root from "./components/roots/top/moment-top_right_root"
import top_root from "./components/roots/top/moment-top_root"
import views from "./components/moment-full-views"

export const Moment = {
    Root: {
        Main: main_root,
        Top: top_root,
        TopLeft: top_left_root,
        TopRight: top_right_root,
        Center: center_root,
        Bottom: bottom_root,
    },
    AudioControl: audio_control,
    ShareButton: share,
    MoreButton: more,
    LikeButton: like,
    Container: container,
    Description: description,
    Date: date,
    Options: options,

    Full: {
        Views: views,
        Comments: comments,
        Shares: shares,
    },
}
