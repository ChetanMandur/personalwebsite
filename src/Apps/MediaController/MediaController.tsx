import { useEffect, useState } from "react"
import { AppRunningID } from "../../Desktop/Contexts/RunningAppsContext"
import "./MediaController.css"
import { VideoCustomOptions } from "../MediaViewer/VideoMedia/VideoMedia"

export type MediaControllerProps = AppRunningID & {
    startingValues: VideoCustomOptions,
    updateVideoCustomOptions: (newOptions : VideoCustomOptions) => void
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


    function perservePitchHandler(){
        setValues({...values, preservesPitch: !values.preservesPitch})
        updateVideoCustomOptions({...values, preservesPitch: !values.preservesPitch})
    }

    function playbackRateHandler(event: React.ChangeEvent<HTMLInputElement>){
        setValues({...values, playbackRate: Number(event.target.value)})
        updateVideoCustomOptions({...values, playbackRate: Number(event.target.value)})
    }

    function grayscaleHandler(){
        // console.log(values)
        setValues({...values, grayscale: !values.grayscale})
        updateVideoCustomOptions({...values, grayscale: !values.grayscale})
        // setValues({...values, grayscale: true})
        // updateVideoCustomOptions({...values, grayscale: true})
    }

    return (
        <div className="media-controller">
            <input type="checkbox" checked={values.preservesPitch}  onChange={perservePitchHandler} name="perservePitch" id="perservePitch" />
            <input type="range" value={values.playbackRate} min={0.1} max={2} step={0.01}  onChange={playbackRateHandler} name="playbackRate" id="playbackRate" />
            <input type="checkbox" checked={values.grayscale}  onChange={grayscaleHandler} name="grayscale" id="grayscale" />
            {app_running_id} {values.playbackRate} {values.preservesPitch ? "yes" : "no"} {values.grayscale ? "yes" : "no"}
        </div>
    )


}