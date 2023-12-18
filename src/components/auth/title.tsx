import React from 'react';
import { StyleSheet } from 'react-native'
import { Text, View } from '../Themed'
import ColorScheme from '../../layout/constants/colors'
import Sizes from '../../layout/constants/sizes';

export default function AuthTitle(props) {

    const container = {
        width: Sizes.screens.width - 60,
        justifyContent: 'center'
    }

    return(
        <View style={container}>
            <Text style={styles.title}>{props.title}</Text>
            <Text style={[styles.subTitle, {color: ColorScheme().textDisabled}]}>{props.subTitle}</Text>
        </View>
    )        

}

const styles = StyleSheet.create({
    title: {
        fontFamily: 'RedHatDisplay-Bold',
        fontSize: 28,
        marginBottom: 8
    },
    subTitle: {
        fontFamily: 'RedHatDisplay-Regular',
        fontSize: 12,
    }
});