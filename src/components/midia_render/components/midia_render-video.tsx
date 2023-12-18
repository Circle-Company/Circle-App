import React from "react"
import { View, Text, Dimensions} from "react-native"

import Video, {
    OnSeekData,
    OnLoadData,
    OnProgressData
} from 'react-native-video'
import ColorTheme from "../../../layout/constants/colors";

interface Props {
    fullscreen: boolean;
    play: boolean;
    currentTime: number;
    duration: number;
    showControls: boolean;
  }

export default function render_video ({}) {

    const videoRef = React.createRef<Video>()
    const [videoState, setVideoState] = React.useState<Props>({
        fullscreen: false,
        play: true,
        currentTime: 0,
        duration: 0,
        showControls: true,
    });

    const video: any = {
        height: Dimensions.get('window').width * (16 / 9),
        width: Dimensions.get('window').width,
        backgroundColor: ColorTheme().backgroundDisabled,
    }
    
      function onLoadEnd(data: OnLoadData) {
        setVideoState(s => ({
          ...s,
          duration: data.duration,
          currentTime: data.currentTime,
        }));
      }
    
      function onProgress(data: OnProgressData) {
        setVideoState(s => ({
          ...s,
          currentTime: data.currentTime,
        }));
      }
    
      function onEnd() {
        setVideoState({...videoState, play: false});
        videoRef.current.seek(0);
      }

    return (
            <Video
            ref={videoRef}
            source={{
                uri:
                'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            }}
            style={video}
            controls={false}
            resizeMode={'cover'}
            paused={!videoState.play}
        />            
    )
}