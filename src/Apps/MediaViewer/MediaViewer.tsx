import {useContext, useEffect, useState} from "react"
import { AppRunningID, RunningAppsContext } from "../../Desktop/Contexts/RunningAppsContext"
import { MyFileSystemFile } from "../FileExplorer/MyFileSystem"
import "./MediaViewer.css"
import { VideoMedia } from "./VideoMedia/VideoMedia"
import { doesPathExist, pathToArray } from "../FileExplorer/FileExplorerHelpers"

// Typing for Media Viewer Props
// Contains name + content of a MyFileSystemFile
export type MediaViewerProps = AppRunningID & {
    fileName: string | null,
    fileContent: MyFileSystemFile | null
}

type CurrentFile = {
    name: string | null,
    content: MyFileSystemFile | null
}

/**
 * Main handler for accessing `MyFileSystemFile` items
 * 
 * Goal is to properly display the content based on its typing
 * @param props Takes file name + file content (app_running_id is assigned at dispatch)
 * @returns Component
 */
export function MediaViewer({fileName, fileContent, app_running_id}:MediaViewerProps){
    // currentFile as a state since the variables can change (variables change when loading a file from drag+drop)
    const [currentFile, setCurrentFile] = useState<CurrentFile>({name: fileName, content: fileContent})

    // RunningAppsContext is used to update the app's addiitonal title
    const {runningAppsDispatch} = useContext(RunningAppsContext)
    

    // Goal is to run when currentFile.name prop is changed
    // Updates app's additional title
    useEffect(()=>{
        runningAppsDispatch({type:"UPDATE-APP-ADDITIONAL-TITLE",
             app_running_id:app_running_id,
             appAdditionalTitle: (currentFile.name == null ? "No media loaded" : currentFile.name)
        })

    },[app_running_id,currentFile.name, runningAppsDispatch])


    /**
     * Each type of `MyFileSystemFile.type` requires a different UI to properly display its content
     * 
     * This function returns the proper UI for the item based on its type 
     * @returns Proper display for item based on `type` property
     */
    function MediaGenerator():JSX.Element{
        if (currentFile.content != null){
            switch (currentFile.content.type) {
                case "IMAGE":
                    return (
                        <div className="image-media">
                            <img src={currentFile.content.data}/>
                        </div>
                    )
    
                case "VIDEO":
                    return (
                        <VideoMedia fileContentData={currentFile.content.data} app_running_id={app_running_id}/>
                    )
    
                
                case "PDF":
                    return <embed src={currentFile.content.data} type="application/pdf" />
    
                default:
                    return <></>
    
            }
        }
        else{
            return (
                <div className="empty-media"
                
                // DragEnter/DragOver event defaults must be prevented to allow for dropping 
                // (If not prevented, onDrop event won't run)
                onDragEnter={(event)=>{
                    if (event.dataTransfer.types.includes("myfilesystem/filepath")){
                        event.preventDefault()
                    }
                }}
                onDragOver={(event)=>{
                    if (event.dataTransfer.types.includes("myfilesystem/filepath")){
                        event.preventDefault()
                    }
                }}

                onDrop={(event)=>{
                    const MyFileSystemFilePath = event.dataTransfer.getData("myfilesystem/filepath")
                    const fileName = pathToArray(MyFileSystemFilePath).pop()
                    // We know that the function is gonna return a file, no need for checks nor the identifier
                    const [content, ] = doesPathExist(MyFileSystemFilePath)
                    setCurrentFile({name: fileName!, content: content as MyFileSystemFile})
                    
                    event.preventDefault()
                }}
                >
                    No media loaded...
                    <br />
                    Please open a file through the File Explorer
                    <br />
                    Or drag and drop a file from the File Explorer
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