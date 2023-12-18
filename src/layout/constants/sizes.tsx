import { Dimensions} from 'react-native'

const WindowWidth = Dimensions.get('window').width
const WindowHeight = Dimensions.get('window').height

const borderRadius = {
    "1sm" : 10,
    "1md" : 20,
    "1lg" : 28,
    "1xl" : 40,
    "1xxl" : 72,  
}
 
const paddings = {
    "1sm" : 10,
    "2sm" : 15,
    "1md" : 20,
    "2md" : 26,
    "1lg" : 28,
    "1xl" : 40,
    "1xxl" : 72,  
}


const borders = {
    "1sm" : 0.5,
    "1md" : 1,
    "1lg" : 2,
    "1xl" : 4,
    "1xxl" : 5,  
}


const margins = {
    "1sm" : 5,
    "2sm" : 10,
    "3sm" : 15,
    "1md" : 20,
    "2md" : 26,
    "1lg" : 28,
    "1xl" : 40,
    "1xxl" : 72,
}


const sizes = {
    "1sm" : 10,
    "2sm" : 15,
    "3sm" : 20,
    "1md" : 30,
    "2md" : 40,
    "3md" : 50,
    "1lg" : 70,  
    "2lg" : 80,  
    "3lg" : 100,  
    "1xxl" : 150,
    "2xxl" : 200,
    "3xxl" : 250,
    "4xxl" : 300,
}
const window = {
    width: WindowWidth,
    height: WindowHeight,
}


const headers = {
    elevation: 0,
    height: 60,
}


const bottomTab = {
    elevation: 0,
    borderTopWidth: 0,
    paddingTop: 5,
    height: 50,
}


const screens = {
    width: window.width,
    height: window.height - headers.height,
    overflow: 'hidden',
    padding: paddings['1sm'] /2,
}


const buttons = {
    width: WindowWidth - 60,
    height: 80,
    borderRadius: 40,
    paddingHorizontal: 28,
    marginHorizontal: 33,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center'    
}


const inputs = {
    width: screens.width - screens.padding * 2,
    height: 56,
    paddingHorizontal: paddings['2sm'],
    paddingVertical: paddings['1sm']/2,
    borderRadius: borderRadius['1sm'],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
}

const moment = {
  tiny: {
    width: 161,
    height: 252,
    paddingTop: 2,
    padding: 5,
    borderRadius: 28
  },
  standart: {
    width: 355,
    height: 556,
    padding: 5,
    borderRadius: 40
  },
  full: {
    width: 390,
    height: 552,
    paddingTop: 2,
    padding: 5,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  }
}

  const blur = {
    blurAmount: 20
  }


  const icons = {
    '1sm': {
      width: 12,
      height: 12,
      padding: 1
    },
    '2sm': {
      width: 17,
      height: 17,
      padding: 2
    },
    '1md': {
      width: 24,
      height: 24,
      padding: 10


    },
    '1lg': {
      width: 32,
      height: 32,
      padding: 15
    }
  }


const isSmallDevice = WindowWidth < 375

export default {
    borderRadius,
    paddings,
    borders,
    margins,
    sizes,
    window,
    headers,
    bottomTab,
    screens,
    buttons,
    inputs,
    moment,
    blur,
    icons,
    isSmallDevice
};