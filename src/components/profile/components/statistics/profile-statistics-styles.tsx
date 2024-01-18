import React from "react"
import fonts from "../../../../layout/constants/fonts"
import { Text, View } from "../../../Themed"


type StatisticsProps = {
    children: React.ReactNode
}

function StatisticsContainer({children}: StatisticsProps): React.ReactNode{
    const container:any = {
        alignItems: 'center',
    }
    return (<View style={container}> {children} </View>)
}

function StatisticsNumber({children}: StatisticsProps): React.ReactNode {
    const statistics_number: any = {
        fontSize: fonts.size.title2,
        fontFamily: fonts.family.Bold
    }
    return(<Text style={statistics_number}></Text>)
}

function StatisticsText({children}: StatisticsProps): React.ReactNode {
    const statistics_text: any = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
    }
    return(<Text style={statistics_text}></Text>)
}

export const StatisticsStyles = {
    Container: StatisticsContainer,
    Text: StatisticsText,
    Number: StatisticsNumber
}