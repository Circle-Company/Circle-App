import main_root from "./components/roots/profile-main_root";
import statistics_container from "./components/statistics/profile-statistics-container";
import statistics_followers from "./components/statistics/profile-statistics-followers";
import statistics_likes from "./components/statistics/profile-statistics-likes";
import statistics_views from "./components/statistics/profile-statistics-views";
import share from "./components/profile-share";
import picture from "./components/profile-picture";
import name from "./components/profile-name";
import description from "./components/profile-description";
export const Profile = {
    MainRoot: main_root,
    Statistics: {
        Container: statistics_container,
        Followers: statistics_followers,
        Likes: statistics_likes,
        Views: statistics_views
    },
    Picture: picture,
    ShareButton: share,
    Name: name,
    Description: description
}