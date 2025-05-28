declare module "react-native-video" {
  import { Component } from "react"
    import { StyleProp, ViewStyle } from "react-native"

  export interface OnLoadData {
    currentTime: number;
    duration: number;
    naturalSize: {
      width: number;
      height: number;
      orientation: "portrait" | "landscape";
    };
  }

  export interface OnProgressData {
    currentTime: number;
    playableDuration: number;
    seekableDuration: number;
  }

  export interface OnBufferData {
    isBuffering: boolean;
  }

  export interface VideoProperties {
    source: { uri: string } | number;
    style?: StyleProp<ViewStyle>;
    resizeMode?: "contain" | "cover" | "stretch" | "none";
    repeat?: boolean;
    paused?: boolean;
    muted?: boolean;
    volume?: number;
    rate?: number;
    playInBackground?: boolean;
    playWhenInactive?: boolean;
    ignoreSilentSwitch?: "ignore" | "obey";
    disableFocus?: boolean;
    controls?: boolean;
    currentTime?: number;
    progressUpdateInterval?: number;
    onLoadStart?: () => void;
    onLoad?: (data: OnLoadData) => void;
    onProgress?: (data: OnProgressData) => void;
    onEnd?: () => void;
    onError?: (error: {
      error: {
        "": string;
        errorString: string;
      };
    }) => void;
    onBuffer?: (data: OnBufferData) => void;
    onTimedMetadata?: (metadata: { metadata: Array<{ value: string; identifier: string }> }) => void;
    poster?: string;
    ref?: any;
  }

  export default class Video extends Component<VideoProperties> {
      seek(time: number): void;
      presentFullscreenPlayer(): void;
      dismissFullscreenPlayer(): void;
  }
} 