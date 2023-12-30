import React, {useState} from 'react';
import { StyleSheet, TouchableOpacity, StatusBar, Dimensions, TextInput, FlatList, useColorScheme } from 'react-native';
import { Text, View } from '../../../components/Themed';
import { TermsOfService } from '../../../utils/terms/data-en'
import ButtonClose from '../../../components/buttons/close'
import Colors from '../../constants/Colors'

const WindowWidth = Dimensions.get('window').width

export default function TermsOfServiceScreen() {

  const isDarkMode = useColorScheme() === 'dark'

  const text = {
    fontFamily: 'RedHatDisplay-Medium',
    color: isDarkMode ? Colors.dark.disableText : Colors.light.disableText,
    marginHorizontal: 10
  }

  const textTopic = {
    fontFamily: 'RedHatDisplay-Medium',
    fontSize: 14,
    marginTop: 5,
    color: isDarkMode ? Colors.dark.disableText : Colors.light.disableText,
  }

  const title = {
    fontFamily: 'RedHatDisplay-Bold',
    fontSize: 20,
    marginLeft: 20
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={'dark-content'} translucent backgroundColor={'transparent'}/>
      <View style={{marginBottom: 30, alignItems: 'center', flexDirection: 'row'}}>
        <ButtonClose
          style={{
            backgroundColor: isDarkMode? Colors.dark.secundaryBg : Colors.light.secundaryBg,
            iconColor: isDarkMode? Colors.dark.icon : Colors.light.icon
          }}
        />
        <Text style={title}>Terms Of Use</Text>
      </View>

      
      <FlatList
        data={TermsOfService}
        removeClippedSubviews={true}
        renderItem={({item}) => {
          return(
            <View style={styles.topicContainer} key={item.id}>
              {item.title?
                <View style={styles.headerContainer}>
                  <Text style={styles.headerText}>{item.title}</Text>
                </View>
                : null
              }
              <Text style={item.title? text: styles.text2}>{item.text}</Text>

              <View style={{marginHorizontal: 10, marginTop:item.topicTitle? 15: 0}}>
                <Text style={textTopic}>{item.topicTitle}</Text>
                {item.topic.map((topic) => {
                  return(
                    <View style={{marginHorizontal: 10}} key={topic.id}>
                      <Text style={textTopic}>{topic.text}</Text>                    
                    </View>

                  )
                  
                })}
              </View>

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
    width: WindowWidth,
    padding: 30,
  },
  titleContainer: {
    marginBottom: 30
  },
  topicContainer: {
    marginBottom: 30
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
    color: '#00000099',
    marginHorizontal: 10
  },
  text2: {
    fontFamily: 'RedHatDisplay-Bold',
    fontSize: 14,
    marginTop: 20
  },
  textTopicTitle: {
    fontFamily: 'RedHatDisplay-Bold',
    fontSize: 14,
  },
  textTopic: {
    fontFamily: 'RedHatDisplay-Medium',
    fontSize: 14,
    marginTop: 5,
    color: '#00000099',
  }
});
