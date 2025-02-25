import { useEffect, useState } from "react"
import { AppRunningID } from "../../Desktop/Contexts/RunningAppsContext"
import { VideoCustomOptions } from "../MediaViewer/MediaViewer"
import "./MediaController.css"

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

    return (
        <div className="media-controller">
            <input type="checkbox" checked={values.preservesPitch}  onChange={perservePitchHandler} name="perservePitch" id="perservePitch" />
            <input type="range" value={values.playbackRate} min={0} max={4} step={0.1}  onChange={playbackRateHandler} name="playbackRate" id="playbackRate" />
            {app_running_id} {values.playbackRate} {values.preservesPitch ? "yes" : "no"}
        </div>
    )


}