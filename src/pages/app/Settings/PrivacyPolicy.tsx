import React, {useState} from 'react';
import { StyleSheet, TouchableOpacity, StatusBar, Dimensions, TextInput, View, FlatList} from 'react-native'
import { Text } from '../../../components/Themed'
import { PrivacyPolicy } from '../../../utils/terms/data-en'
import sizes from '../../../layout/constants/sizes';

const WindowWidth = Dimensions.get('window').width

export default function SettingsPrivacyPolicy() {

  const container: any = {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: sizes.paddings['1md']
  }

  const topic_container: any = {
    marginBottom: sizes.margins['2md']
  }

  return (
    <View style={container}>
      <StatusBar barStyle={'dark-content'} translucent backgroundColor={'transparent'}/>
      <FlatList
        data={PrivacyPolicy}
        removeClippedSubviews={true}
        renderItem={({item}) => {
          return(
            <View style={topic_container}>
              {item.title?
                <View style={styles.headerContainer}>
                  <Text style={styles.headerText}>{item.title}</Text>
                </View>   
                : null             
              }

              
              <Text style={item.title? styles.text: styles.text2}>{item.text}</Text>
            </View>
          )
        }}
        keyExtractor={(item) => item.id}
        horizontal={false}
        showsVerticalScrollIndicator={false}     
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    width: WindowWidth,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 20,
  },

  topicContainer: {
    marginBottom: 50
  },
  headerContainer: {
    marginBottom: 10
  },
  headerText: {
    fontFamily: 'RedHatDisplay-Bold',
    fontSize: 18
  },
  text: {
    fontFamily: 'RedHatDisplay-Medium',
    color: '#fff',
    marginHorizontal: 10
  },
  text2: {
    fontFamily: 'RedHatDisplay-Bold',
    fontSize: 14,
    marginTop: 20
  }
});
