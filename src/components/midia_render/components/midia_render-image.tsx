import React from "react"
import { View, Text, Dimensions, Image} from "react-native"
import FastImage from "react-native-fast-image";
import ColorTheme from "../../../layout/constants/colors";
import { useMidiaRenderContext } from "../midia_render-context";
import { useMomentContext } from "../../moment/moment-context";
import { MidiaRender } from "..";

type RenderImageProps = {
  blur?: boolean
}

export default function render_image ({blur = false}: RenderImageProps) {
  const {content_sizes, midia} = useMidiaRenderContext()

  const image: any = {
    height: content_sizes.height,
    width: content_sizes.width,
  }
  const opacity_view: any = {
    backgroundColor: ColorTheme().background,
    opacity: 0.6
  }

  if(blur) {
    return (
      <View style={opacity_view}>
        <Image
          source={{uri: String(midia.nhd_resolution)}}
          style={image}
          resizeMode="cover"
          blurRadius={35}
        />        
      </View>

    )
  }else {
    return (
      <FastImage
        source={{uri: String(midia.fullhd_resolution)}}
        style={image}
        resizeMode="cover"
      />
    )    
  }


}