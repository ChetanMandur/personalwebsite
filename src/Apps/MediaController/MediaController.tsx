import { useEffect, useState } from "react"
import { AppRunningID } from "../../Desktop/Contexts/RunningAppsContext"
import "./MediaController.css"
import { VideoUpdatableOptions } from "../MediaViewer/VideoMedia/VideoMedia"

export type MediaControllerProps = AppRunningID & {
    startingValues: VideoUpdatableOptions,
    videoRef: React.MutableRefObject<HTMLVideoElement | null>,
    updateVideoCustomOptions: <T extends keyof VideoUpdatableOptions>(newOptionKey: T, newOptionValue: VideoUpdatableOptions[T]) => void,
    connectToMediaViewer: (newControllerAppID:string) => void
}



export function MediaController({app_running_id,startingValues, videoRef, updateVideoCustomOptions, connectToMediaViewer}:MediaControllerProps){
    const [values, setValues] = useState<VideoUpdatableOptions>(startingValues)

    useEffect(()=>{
        connectToMediaViewer(app_running_id)

        return ()=>{
            connectToMediaViewer("")

        }
    },[app_running_id, connectToMediaViewer])

    useEffect(()=>{
        const intervalID = setInterval(()=>{setValues(pendingState=>({...pendingState, currentTime: videoRef.current!.currentTime, playing: !videoRef.current?.paused}))}, 0)

        return ()=>{
            clearInterval(intervalID)
        }

    },[])


    function changeValue<T extends keyof VideoUpdatableOptions>(newOptionKey: T, newOptionValue: VideoUpdatableOptions[T]){
        // console.log(newOptionKey, newOptionValue)
        setValues(pendingState =>({...pendingState, [newOptionKey]:newOptionValue}))
        updateVideoCustomOptions(newOptionKey, newOptionValue)
    }
    

    function hexToRGB(hex:string):[red:number, green:number, blue:number]{
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        // return {red:r, green:g, blue:b} 
        return [ r, g, b ];
    }


    return (
        <div className="media-controller">
            <div className="media-controller-section">
                Progress Bar
                <div className="media-controller-section-progressbar">
                    <div className="media-controller-section-progressbar-playpause-button common-border" onClick={()=>{changeValue("playing", Boolean(!values.playing))}}><img src={values.playing == false ? "https://www.svgrepo.com/show/486784/play.svg " : "https://www.svgrepo.com/show/506666/pause.svg"} alt="" /> </div>
                    <input type="range"  tabIndex={-1} value={values.currentTime} min={0} max={videoRef.current?.duration} step={0.000001} onChange={(event)=>{changeValue("currentTime", Number(event.target.value))}} name="currentTime" id="currentTime" />

                </div>
                {values.currentTime.toFixed(6)}
            </div>
            <div className="media-controller-section">
                Preserve Pitch
                <input type="checkbox" tabIndex={-1} checked={values.preservesPitch} onChange={()=>{changeValue("preservesPitch", Boolean(!values.preservesPitch))}} name="perservePitch" id="perservePitch" />
            </div>

            <div className="media-controller-section">
                Playback Rate
                <input type="range" tabIndex={-1} value={values.playbackRate} min={0} max={2} step={0.1} onChange={(event)=>{changeValue("playbackRate", Number(event.target.value))}} name="playbackRate" id="playbackRate" />
                {values.playbackRate}
            </div>
            <div className="media-controller-section-holder">
                <div className="media-controller-section">
                    Grayscale
                    <input type="checkbox" tabIndex={-1} checked={values.grayscale} onChange={()=>{changeValue("grayscale", Boolean(!values.grayscale))}} name="grayscale" id="grayscale" />
                </div>
                <div className="media-controller-section">
                    Inverse
                    <input type="checkbox" tabIndex={-1} checked={values.inverseColour} onChange={()=>{changeValue("inverseColour", Boolean(!values.inverseColour))}} name="inverseColour" id="inverseColour" />
                </div>
            </div>

            <div className="media-controller-section">
                <div className="color-swap-title">
                    Colour Swap
                    <div className="colour-swap-add common-border" onClick={()=>{
                        changeValue("colourSwapList", [...values.colourSwapList, {
                            from:{red:0, green:0, blue:0, alpha:0},
                            to:{red:0, green:0, blue:0, alpha:0},
                            range:0
                        }])
                    }}>+</div>
                </div>
                <div className="color-swap-section">
                    {
                        values.colourSwapList.map(
                            (value, index)=>{
                                
                                return(
                                    <div className="colour-swap-value">
                                        FROM:
                                        <input type="color" name="from-color-swap" id="from-color-swap"
                                            onChange={(event)=>{
                                                [values.colourSwapList[index].from.red, values.colourSwapList[index].from.green, values.colourSwapList[index].from.blue] = hexToRGB(event.target.value)
                                            }}
                                        />

                                        TO:
                                        <input type="color" name="to-color-swap" id="to-color-swap"
                                            onChange={(event)=>{
                                                [values.colourSwapList[index].to.red, values.colourSwapList[index].to.green, values.colourSwapList[index].to.blue] = hexToRGB(event.target.value)
                                            }}
                                        />
                                        
                                        RANGE:
                                        <input type="number" value={value.range}
                                            onChange={(event)=>{
                                                values.colourSwapList[index].range = Number(event.target.value)
                                                changeValue("colourSwapList", [...values.colourSwapList])

                                            }}
                                        />

                                        <div className="colour-swap-delete common-border" onClick={()=>{
                                            values.colourSwapList.splice(index, 1)
                                            changeValue("colourSwapList",
                                                [...values.colourSwapList]
                                            )
                                        }}>-</div>
                                    </div>
                                )
                            }
                        )
                    }
                </div>
            </div>

        </div>
    )


}