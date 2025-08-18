import React from "react"
import sizes from "../../../constants/sizes"
import PersistedContext from "../../../contexts/Persisted"
import { View } from "../../Themed"
import { UserShow } from "../../user_show"
export default function AccountHeaderCenter() {
    const { session } = React.useContext(PersistedContext)

    const container = {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: sizes.margins["1md"],
    }
    return (
        <View style={container}>
            <UserShow.Root data={session.user}>
                <UserShow.Username
                    pressable={false}
                    displayYou={false}
                    displayOnMoment={false}
                    scale={1.3}
                    margin={0}
                />
            </UserShow.Root>
        </View>
    )
}
