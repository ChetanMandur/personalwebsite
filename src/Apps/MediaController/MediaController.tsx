import React from "react"
import { AppRunningID } from "../../Desktop/Contexts/RunningAppsContext"
import "./MediaController.css"
import { VideoUpdatableOptions } from "../MediaViewer/VideoMedia/VideoMedia"
import { VideoMediaController } from "./VideoMediaController/VideoMediaController"


////// Media Controller acts as a handler that will display different controls based on the media type
//// Because of this, different controls require different props
//// We need to define the props for each type of controller
//// While each type of controller will have different props, there are two props consistant between all of them:
    //// (mediaType) An identifier for which type of media the controller is for
    //// (app_running_id) The app running id for the controller

// Typing used for controller for Video Media
// The information contains:
    // The values currently used by the video BEFORE the MediaController was launched (startingValues)
        // Autofills the starting position/value of the controller inputs
    // A reference to the <video> tag used by the video (videoRef)
    // A reference to the <canvas> tag used by the video (canvasRef)
    // A function to relay property updates back to the original video (updateVideoCustomOptions)
    // A function to relay the controller's app running ID back to the video (setControllerAppRunningID)
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