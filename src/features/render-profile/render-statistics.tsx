import { Profile } from "../../components/profile";
import { ProfileReciveDataProps } from "../../components/profile/profile-types";

type RenderStatisticsProps = {
    data: ProfileReciveDataProps
}

export default function RenderStatistics({
    data
} : RenderStatisticsProps) {

    return(
        <Profile.MainRoot data={data}>
            <Profile.Statistics.Container>
                <Profile.Statistics.Followers/>
                <Profile.Statistics.Likes/>
                <Profile.Statistics.Views/>
            </Profile.Statistics.Container>
        </Profile.MainRoot>
    )
}