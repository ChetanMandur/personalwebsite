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
        const intervalID = setInterval(()=>{setValues(pendingState=>({...pendingState, currentTime: videoRef.current!.currentTime}))}, 0)

        return ()=>{
            clearInterval(intervalID)
        }

    },[])


    function changeValue<T extends keyof VideoUpdatableOptions>(newOptionKey: T, newOptionValue: VideoUpdatableOptions[T]){
        // console.log(newOptionKey, newOptionValue)
        setValues(pendingState =>({...pendingState, [newOptionKey]:newOptionValue}))
        updateVideoCustomOptions(newOptionKey, newOptionValue)
    }


    return (
        <div className="media-controller">
            <div className="media-controller-section">
                Progress Bar
                <input type="range" value={values.currentTime} min={0} max={videoRef.current?.duration} step={0.000001} onChange={(event)=>{changeValue("currentTime", Number(event.target.value))}} name="currentTime" id="currentTime" />
                {values.currentTime.toFixed(6)}
            </div>
            <div className="media-controller-section">
                Preserve Pitch
                <input type="checkbox" checked={values.preservesPitch} onChange={()=>{changeValue("preservesPitch", Boolean(!values.preservesPitch))}} name="perservePitch" id="perservePitch" />
            </div>

            <div className="media-controller-section">
                Playback Rate
                <input type="range" value={values.playbackRate} min={0} max={2} step={0.1} onChange={(event)=>{changeValue("playbackRate", Number(event.target.value))}} name="playbackRate" id="playbackRate" />
                {values.playbackRate}
            </div>
            <div className="media-controller-section-holder">
                <div className="media-controller-section">
                    Grayscale
                    <input type="checkbox" checked={values.grayscale} onChange={()=>{changeValue("grayscale", Boolean(!values.grayscale))}} name="grayscale" id="grayscale" />
                </div>
                <div className="media-controller-section">
                    Inverse Colour
                    <input type="checkbox" checked={values.inverseColour} onChange={()=>{changeValue("inverseColour", Boolean(!values.inverseColour))}} name="inverseColour" id="inverseColour" />
                </div>
            </div>

        </div>
    )


}