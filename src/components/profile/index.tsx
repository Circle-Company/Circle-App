import main_root from "./components/roots/profile-main_root"
import share from "./components/profile-share"
import picture from "./components/profile-picture"
import name from "./components/profile-name"
import description from "./components/profile-description"
import name_follow from "./components/profile-name-followers"
import { FollowButton } from "./components/profile-follow"
import { FriendButton } from "./components/profile-friend"
import { BlockingCard } from "./components/profile-blocking"
import { BlockedByCard } from "./components/profile-bloked"
export const Profile = {
    MainRoot: main_root,
    Picture: picture,
    ShareButton: share,
    Name: name,
    NameFollow: name_follow,
    Follow: FollowButton,
    Friend: FriendButton,
    Description: description,
    BlockingCard,
    BlockedByCard,
}
