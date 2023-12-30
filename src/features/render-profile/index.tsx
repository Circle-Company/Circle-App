import RenderStatistics from "./render-statistics";
import profileData from '../../data/profile.json'

export default function RenderProfile() {

    return (
        <RenderStatistics data={profileData}/>
    )
}