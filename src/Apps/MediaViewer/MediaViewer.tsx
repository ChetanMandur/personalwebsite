import React, {useContext, useEffect, useState} from "react"
import { AppRunningID, RunningAppsContext } from "../../Desktop/Contexts/RunningAppsContext"
import { FileFormatMapper, MyFileSystemFile } from "../FileExplorer/MyFileSystem"
import "./MediaViewer.css"
import { VideoMedia } from "./VideoMedia/VideoMedia"
import { doesPathExist, getChildItemName} from "../FileExplorer/FileExplorerHelpers"

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
            /**
             * Common function used by both the `onDragEnter` and the `onDragOver` event listeners for the 'empty-media' div
             * 
             * Defined in a seperate function since both event listeners use identical functions
             * 
             * Goal of the function is to determine if the element being dragged into/over the div is a valid input
             * @param event The drag event given by the onDragEnter & onDragOver events listeners
             */
            function onDragHandler(event:React.DragEvent<HTMLDivElement>){
                // Only accept elements that are either from MyFileSystem or the user's computer's file system
                if (event.dataTransfer.types.includes("myfilesystem/filepath") || event.dataTransfer.types.includes("Files")){
                    // Defines the type of drop effect used
                    event.dataTransfer.dropEffect = "link"
                    // Prevent default is needed to stop the browser default behaviour (which is to not allow any elements)
                    event.preventDefault()
                }
            }


            return (
                <div className="empty-media"
                
                // DragEnter/DragOver event defaults must be prevented to allow for dropping 
                // (If not prevented, onDrop event won't run)
                onDragEnter={onDragHandler}
                onDragOver={onDragHandler}

                // Handler for when elements are dropped into the div
                onDrop={(event)=>{
                    // If the element come from MyFileSystem
                    if (event.dataTransfer.types.includes("myfilesystem/filepath")){
                        // Obtain the data from the element (ie. the path of file from within MyFileSystem)
                        const MyFileSystemFilePath = event.dataTransfer.getData("myfilesystem/filepath")
                        // Get the name of the file from the path
                        const fileName = getChildItemName(MyFileSystemFilePath)
                        // Get the contents of the file
                            // We know that the function is gonna return a file, no need for checks nor the identifier
                        const [content, ] = doesPathExist(MyFileSystemFilePath)
                        // Set the current file as the one obtained from the path
                        setCurrentFile({name: fileName!, content: content as MyFileSystemFile})
                        
                    }
                    // If the element(s) come from the user's file system
                    if (event.dataTransfer.types.includes("Files")){
                        // The user is allowed to drag multiple files at once
                        let counter:number = 0
                        // For each of the files the user has dragged into the div
                        for (const draggedSystemFile of event.dataTransfer.files ){
                            // The final "." represents the seperator of the file name and file format
                            const endOfFileName = draggedSystemFile.name.lastIndexOf(".")
                            const fileName = draggedSystemFile.name.substring(0, endOfFileName)
                            const fileFormat = draggedSystemFile.name.substring(endOfFileName+1, draggedSystemFile.name.length)
                            
                            // Find the type of file based on the file format
                            const fileType = FileFormatMapper(fileFormat)

                            // If file type not null, that means the file is of valid typing
                                // This means that MediaViewer is able to open the file
                            if (fileType != null){
                                // Open the file and read its data
                                const reader = new FileReader()
                                reader.readAsDataURL(draggedSystemFile)

                                // If counter is 0, that means this is the first file in the list
                                    // The first file must open in the MediaViewer that files were dragged into
                                if (counter == 0){
                                    reader.onload = ()=>{
                                        // Update currentFile with the data from the file
                                        setCurrentFile({name: fileName, content:{type:fileType, hidden:false, data:reader.result as string}})
                                    }
                                }
                                // If counter is not 0, this means that another MediaViewer must be opened with the file
                                else{
                                    reader.onload = ()=>{
                                        // Open a new MediaViewer with the new file as its props
                                        runningAppsDispatch({type:"ADD", app_name:"MediaViewer",  props:{fileContent:{type:fileType, hidden:false, data:reader.result as string}, fileName:fileName} as MediaViewerProps})

                                    }
                                }
                            }
                            // If file is null, that means that the file cannot be opened
                            else{
                                console.log("This format is not supported")
                            }
                            counter += 1
                        }  
                        event.preventDefault()
                    }
                }}
                >
                    No media loaded...
                    <br />
                    Please open a file through the File Explorer
                    <br />
                    Or drag and drop a file from the File Explorer
                    <br />
                    Or drag and drop a file from your computer 
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