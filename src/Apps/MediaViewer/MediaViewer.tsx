import {useContext, useEffect} from "react"
import { AppRunningID, RunningAppsContext } from "../../Desktop/Contexts/RunningAppsContext"
import { MyFileSystemFile } from "../FileExplorer/MyFileSystem"
import "./MediaViewer.css"
import { VideoMedia } from "./VideoMedia/VideoMedia"

// Typing for Media Viewer Props
// Contains name + content of a MyFileSystemFile
export type MediaViewerProps = AppRunningID & {
    fileName: string | null,
    fileContent: MyFileSystemFile | null
}


/**
 * Main handler for accessing `MyFileSystemFile` items
 * 
 * Goal is to properly display the content based on its typing
 * @param props Takes file name + file content (app_running_id is assigned at dispatch)
 * @returns Component
 */
export function MediaViewer({fileName, fileContent, app_running_id}:MediaViewerProps){
    // RunningAppsContext is used to update the app's addiitonal title
    const {runningAppsDispatch} = useContext(RunningAppsContext)
    

    // Goal is to run when fileName prop is changed
    // Updates app's additional title
    useEffect(()=>{
        runningAppsDispatch({type:"UPDATE-APP-ADDITIONAL-TITLE",
             app_running_id:app_running_id,
             appAdditionalTitle: (fileName == null ? "No media loaded" : fileName)
        })

    },[app_running_id,fileName, runningAppsDispatch])


    /**
     * Each type of `MyFileSystemFile.type` requires a different UI to properly display its content
     * 
     * This function returns the proper UI for the item based on its type 
     * @returns Proper display for item based on `type` property
     */
    function MediaGenerator():JSX.Element{
        if (fileContent != null){
            switch (fileContent.type) {
                case "IMAGE":
                    return (
                        <div className="image-media">
                            <img src={fileContent.data}/>
                        </div>
                    )
    
                
                case "VIDEO":
                    return (
                        <VideoMedia fileContentData={fileContent.data} app_running_id={app_running_id}/>
                    )
    
                
                case "PDF":
                    return <embed src={fileContent.data} type="application/pdf" />
    
                default:
                    return <></>
    
            }
        }
        else{
            return (
                <div className="empty-media">
                    No media loaded...
                    <br />
                    Please open a file through the file explorer
                </div>
            )
        }
    }


    return (
        <div className="media-viewer">
            {MediaGenerator()}
        </div>
    )
}