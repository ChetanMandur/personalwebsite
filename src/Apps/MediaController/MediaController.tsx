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

    const [currentTime, setCurrentTime]= useState<number>(0)

    useEffect(()=>{
        connectToMediaViewer(app_running_id)

        return ()=>{
            connectToMediaViewer("")

        }
    },[app_running_id, connectToMediaViewer])

    useEffect(()=>{
        const intervalID = setInterval(()=>{setCurrentTime(videoRef.current!.currentTime)}, 0)

        return ()=>{
            clearInterval(intervalID)
        }

    },[])

    // useEffect(()=>{
    //     console.log("values", values)
    // },[values])


    function changeValue<T extends keyof VideoUpdatableOptions>(newOptionKey: T, newOptionValue: VideoUpdatableOptions[T]){
        // console.log(newOptionKey, newOptionValue)
        setValues({...values, [newOptionKey]:newOptionValue})
        updateVideoCustomOptions(newOptionKey, newOptionValue)
    }


    return (
        <div className="media-controller">
            <input type="checkbox" checked={values.preservesPitch} onChange={()=>{changeValue("preservesPitch", Boolean(!values.preservesPitch))}} name="perservePitch" id="perservePitch" />
            <input type="range" value={values.playbackRate} min={0.1} max={2} step={0.01} onChange={(event)=>{changeValue("playbackRate", Number(event.target.value))}} name="playbackRate" id="playbackRate" />
            <input type="checkbox" checked={values.grayscale} onChange={()=>{changeValue("grayscale", Boolean(!values.grayscale))}} name="grayscale" id="grayscale" />
            <input type="checkbox" checked={values.inverseColour} onChange={()=>{changeValue("inverseColour", Boolean(!values.inverseColour))}} name="inverseColour" id="inverseColour" />

            {/* <input type="range" value={values} min={} max={} step={} onChange={(event)=>{changeValue(, Number(event.target.value))}} name="playbackRate" id="playbackRate" /> */}
            {/* <input type="checkbox" checked={values} onChange={()=>{changeValue(,!values)}} name="" id="" /> */}
            {app_running_id} 
            {values.playbackRate} 
            {values.preservesPitch ? "yes" : "no"} 
            {values.grayscale ? "yes" : "no"} 
            {values.inverseColour ? "yes" : "no"}
            {/* {currentTime} */}
            <input type="range" value={currentTime} min={0} max={videoRef.current?.duration} step={0.01} onChange={(event)=>{changeValue("currentTime", Number(event.target.value))}} name="currentTime" id="currentTime" />

        </div>
    )


}