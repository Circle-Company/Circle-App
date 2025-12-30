import audio_control from "./components/moment-audio_control"
import bottom_root from "./components/roots/bottom/moment-bottom_root"
import center_root from "./components/roots/center/moment-center_root"
import container from "./components/moment-container"
import date from "./components/moment-date"
import description from "./components/moment-description"
import like from "./components/moment-like"
import main_root from "./components/roots/moment-main_root"
import top_left_root from "./components/roots/top/moment-top_left_root"
import top_right_root from "./components/roots/top/moment-top_right_root"
import top_root from "./components/roots/top/moment-top_root"
import iosLikeButton from "../ios/ios.like.button"
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
    LikeButton: like,
    LikeButtonIOS: iosLikeButton,
    Container: container,
    Description: description,
    Date: date,
}
