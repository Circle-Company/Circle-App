import React from "react"
import { View } from "../../../components/Themed"
import { MidiaRender } from "../../../components/midia_render"
import { Pressable, useColorScheme } from "react-native"
import SelectMomentsContext from "../../../contexts/selectMoments"
import CheckCircle from '../../../assets/icons/svgs/check_circle.svg'
import { Moment } from "../../../components/moment"
import { colors } from "../../../layout/constants/colors"
import EditMemoryContext from "../edit_memory_context"

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

    const {putMomentOnList, deleteMomentFromList, selectedMoments} = React.useContext(EditMemoryContext)
    const isDarkMode = useColorScheme() === 'dark'
    React.useEffect(() => {
        setSelected(false)
        if(!preview){
            if(selectedMoments.length> 0 ){
                selectedMoments.map((item) => {
                    if(moment.id == item.id) setSelected(true)
                })
            }            
        }

    }, [selectedMoments])

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
        position: 'absolute',
        backgroundColor: '#00000004',
        width:117 * scale,
        height: 181 * scale,
        alignItems: 'center',
        justifyContent: 'center'
    }

    async function handlePress() {
        console.log(selectedMoments)
        if(!preview){
            if(selected){
                deleteMomentFromList(moment)
                setSelected(false)   
            } else {
                putMomentOnList(moment),
                setSelected(true)                 
            }
           
        }
    }

    if(selected) {
        return (
            <Pressable onPress={handlePress}>
                <View style={container}>
                    <View style={selected_container}>
                        <CheckCircle fill={String(isDarkMode? colors.gray.white: colors.gray.black)}/>
                    </View>
                    <View style={{opacity: 0.5}}>
                        <MidiaRender.Root data={moment.midia} content_sizes={{width:117 * scale, height: 181 * scale, padding: 0}}>
                            
                            <MidiaRender.RenderImage isFeed={false} enableBlur={true} blur={true} blurRadius={20} blurColor="#000000"/>
                        </MidiaRender.Root>
                    </View>                                    
                </View>

            </Pressable>
        )
    } else {
        return (
            <Pressable onPress={handlePress}>
                <View style={container}>
                    <MidiaRender.Root data={moment.midia} content_sizes={{width:117 * scale, height: 181 * scale, padding: 0}}>
                        <MidiaRender.RenderImage isFeed={false} blur={false}/>
                    </MidiaRender.Root>
                </View>            
            </Pressable>
        )        
    }

}