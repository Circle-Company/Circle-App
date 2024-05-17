import React from "react"
import { View } from "../../../components/Themed"
import { MidiaRender } from "../../../components/midia_render"
import { Pressable, Text } from "react-native"
import SelectMomentsContext from "../../../contexts/selectMoments"
import CheckCircle from '../../../assets/icons/svgs/check_circle.svg'

type RenderMomentProps = {
    moment: Moment,
    marginTop?: number,
    marginLeft?: number,
    marginRight?: number
    scale?: number,
    borderRadius?: number,
    preview?: boolean
}

type Moment = {
    id: number,
    content_type: "IMAGE" | "VIDEO",
    midia: {
        fullhd_resolution: string
    }
}

export default function RenderMoment({
    moment,
    marginTop = 8,
    scale = 1,
    marginLeft = 0,
    marginRight = 0,
    borderRadius = 13,
    preview = false
}: RenderMomentProps) {

    const {put_moment_on_list, delete_moment_from_list, selectedMoments} = React.useContext(SelectMomentsContext)
    React.useEffect(() => {
        setSelected(false)
        if(!preview){
            if(selectedMoments.length> 0 ){
                selectedMoments.map((item) => {
                    if(moment.id == item.id) setSelected(true)
                })
            }            
        }

    }, [ selectedMoments])

    const [selected, setSelected] = React.useState(false)
    const container:any = {
        overflow: 'hidden',
        borderRadius: borderRadius * scale,
        marginTop,
        marginLeft,
        marginRight
    }

    const selected_container = {
        top: 0,
        left: 0,
        zIndex: 10,
        position: 'absolute',
        backgroundColor: '#00000000',
        width:117 * scale,
        height: 181 * scale,
        alignItems: 'center',
        justifyContent: 'center'
    }

    async function Select() {
        if(!preview){
            await put_moment_on_list(moment),
            await setSelected(true)            
        }

    }

    async function Unselect() {
        if(!preview) {
            await delete_moment_from_list(moment)
            await setSelected(false)            
        }

    }

    if(selected) {
        return (
            <Pressable onPress={() => {Unselect()}}>
                <View style={container}>
                    {selected &&
                        
                        <View style={selected_container}>
                            <CheckCircle fill='#ffffff99'/>
                        </View>
                    }
                    <MidiaRender.Root data={moment.midia} content_sizes={{width:117 * scale, height: 181 * scale, padding: 0}}>
                        <MidiaRender.RenderImage blur={selected? true: false} blurRadius={10} blurColor="#000000"/>
                    </MidiaRender.Root>
                </View>            
            </Pressable>
        )
    } else {
        return (
            <Pressable onPress={() => {Select()}}>
                <View style={container}>
                    <MidiaRender.Root data={moment.midia} content_sizes={{width:117 * scale, height: 181 * scale, padding: 0}}>
                        <MidiaRender.RenderImage/>
                    </MidiaRender.Root>
                </View>            
            </Pressable>
        )        
    }

}