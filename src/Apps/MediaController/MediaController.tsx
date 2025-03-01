import { useEffect, useState } from "react"
import { AppRunningID } from "../../Desktop/Contexts/RunningAppsContext"
import "./MediaController.css"
import { VideoCustomOptions } from "../MediaViewer/VideoMedia/VideoMedia"

export type MediaControllerProps = AppRunningID & {
    startingValues: VideoCustomOptions,
    updateVideoCustomOptions: <T extends keyof VideoCustomOptions>(newOptionKey: T, newOptionValue: VideoCustomOptions[T]) => void,
    connectToMediaViewer: (newControllerAppID:string) => void
}



export function MediaController({app_running_id,startingValues, updateVideoCustomOptions, connectToMediaViewer}:MediaControllerProps){
    const [values, setValues] = useState<VideoCustomOptions>(startingValues)

    useEffect(()=>{
        connectToMediaViewer(app_running_id)

        return ()=>{
            connectToMediaViewer("")

        }
    },[app_running_id, connectToMediaViewer])


    function changeValue<T extends keyof VideoCustomOptions>(newOptionKey: T, newOptionValue: VideoCustomOptions[T]){
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
        </div>
    )


}