import React from "react"
import { AppRunningID } from "../../Desktop/Contexts/RunningAppsContext"
import "./MediaController.css"
import { VideoUpdatableOptions } from "../MediaViewer/VideoMedia/VideoMedia"
import { VideoMediaController } from "./VideoMediaController/VideoMediaController"

export type VideoMediaControllerProps = AppRunningID & {
    mediaType: "VIDEO",
    startingValues: VideoUpdatableOptions,
    videoRef: React.MutableRefObject<HTMLVideoElement | null>,
    canvasRef:React.MutableRefObject<HTMLCanvasElement | null>,
    updateVideoCustomOptions: <T extends keyof VideoUpdatableOptions>(newOptionKey: T, newOptionValue: VideoUpdatableOptions[T]) => void,
    setControllerAppRunningID: React.Dispatch<React.SetStateAction<string>>
}

type EmptyMediaControllerProps = AppRunningID &  {
    mediaType: "NONE"
}

export type MediaControllerProps = VideoMediaControllerProps|EmptyMediaControllerProps


export function MediaController(props:MediaControllerProps){

    function mediaControllerSelector(){
        switch (props.mediaType) {
            case "VIDEO":
                return <VideoMediaController {...props} />
            
            case "NONE":
                return (
                    <div className="media-controller-section">
                        <div className="media-controller-section-titlebar">
                            This has led u nowhere
                        </div>
                    </div>
                ) 

            default:
                return  (
                    <div className="media-controller-section">
                        <div className="media-controller-section-titlebar">
                            You are not supposed to be here
                        </div>
                    </div>
                ) 
        }
    }

    return(
        <div className="media-controller">
            {mediaControllerSelector()}
        </div>
        
    )
    
}