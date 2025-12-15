import main_root from "./components/roots/profile-main_root"
import statistics_container from "./components/statistics/profile-statistics-container"
import statistics_followers from "./components/statistics/profile-statistics-followers"
import statistics_likes from "./components/statistics/profile-statistics-likes"
import statistics_views from "./components/statistics/profile-statistics-views"
import share from "./components/profile-share"
import picture from "./components/profile-picture"
import name from "./components/profile-name"
import description from "./components/profile-description"
import last_active_at from "./components/profile-last_active_at"
import name_follow from "./components/profile-name-followers"
export const Profile = {
    MainRoot: main_root,
    Statistics: {
        Container: statistics_container,
        Followers: statistics_followers,
        Likes: statistics_likes,
        Views: statistics_views,
    },
    Picture: picture,
    ShareButton: share,
    Name: name,
    NameFollow: name_follow,
    Description: description,
    LastActiveAt: last_active_at,
}
