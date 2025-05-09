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

// Typing used for the controller for Video Media
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

// Typing used when no media type is given
    // Used as a default state
type EmptyMediaControllerProps = AppRunningID &  {
    mediaType: "NONE"
}

// Union typing, encompasses all possible controller prop types
export type MediaControllerProps = VideoMediaControllerProps|EmptyMediaControllerProps


/**
 * Main handler for opening a controller for a specific `MediaViewer` instance
 * 
 * @param props The props required by the controller
 * - Since props can have many shapes, we just keep it as a whole object
 * - This allows us to not only access common information (ie. `mediaType`), but also pass all unique props to the proper controller component
 * @returns The controller used for the specified media type
 */
export function MediaController(props:MediaControllerProps){

    
    /**
     * Each type of media requires a different UI to properly display its controller options
     * 
     * This function returns the proper UI for the media based on its type
     * @returns Proper display for item based on `mediaType` property
     */
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