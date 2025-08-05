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

    // emptyMediaState represents whether or not the empty media has an element being dragged within it
        // If an element is being dragged, represents whether or not the elements are valid to be read or not (if dropped)
    const [emptyMediaState, setEmptyMediaState] = useState<"NONE"|"VALID-DROP"|"INVALID-DROP">("NONE")

    // RunningAppsContext is used to update the app's addiitonal title
    const {runningAppsDispatch} = useContext(RunningAppsContext)
    

    // Goal is to run when currentFile.name prop is changed
    // Updates app's additional title
    useEffect(()=>{
        runningAppsDispatch({type:"UPDATE-APP-TITLE-DETAILS",
             app_running_id:app_running_id,
             appTitleDetails: (currentFile.name == null ? "No media loaded" : currentFile.name)
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
             * Function to determine if the files being dragged from the user's computer file system are all valid for `MediaViewer`
             * 
             * Used to determine whether or not the files being dragged should be allowed by `MediaViewer`
             * @param files The list of files that are currently being dragged
             * - Of type `DataTransferItemList` (given by `event.dataTransfer.items`) as the true files list (`event.dataTransfer.files`) is only avaiable after a drop
             * @returns `boolean` whether or not the files being dragged are all readable by `MediaViewer`
             */
            function CheckFilesValidity(files: DataTransferItemList):boolean{
                // For each file being dragged
                for (const file of files){
                    // Grab the file format
                    const fileFormat = file.type.split("/")[1]

                    // If file format does not exist within the map, exit early with a `false`
                        // This is because, it only takes 1 invalid file for the drop to be invalid
                    if (FileFormatMapper(fileFormat) == null){
                        return false
                    }
                }

                // All files exist within the map, return `true`
                return true
            }

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
                    // If elements come from the user's computer, check if the file formats are supported
                        // If even one file is not supported, don't allow the elements
                if (event.dataTransfer.types.includes("myfilesystem/filepath") || (event.dataTransfer.types.includes("Files") && CheckFilesValidity(event.dataTransfer.items))){
                    setEmptyMediaState("VALID-DROP")
                    // Defines the type of drop effect used
                    event.dataTransfer.dropEffect = "link"

                    // Prevent default is needed to stop the browser default behaviour (which is to not allow any elements)
                    event.preventDefault()
                }

                // When the elements being dragged are not allowed/are not a valid input
                    // Block the drop from happening and set emptyMediaState to `INVALID-DROP`
                else{
                    setEmptyMediaState("INVALID-DROP")
                    // Block the drop from happening
                    event.dataTransfer.dropEffect = "none"
                    event.preventDefault()
                }
            }


            return (
                <div className="empty-media"

                // DragEnter/DragOver event defaults must be prevented to allow for dropping 
                // (If not prevented, onDrop event won't run)
                onDragEnter={onDragHandler}
                onDragOver={onDragHandler}

                // Once a drag leaves the div, reset emptyMediaState back to "NONE"
                    // This is because this would mean that no items/elements are being dragged into the div
                onDragLeave={(event)=>{event.preventDefault();setEmptyMediaState("NONE")}}


                // Handler for when elements are dropped into the div
                onDrop={(event)=>{
                    // On drop, set emptyMediaState back to "NONE" (not needed but yolo)
                    setEmptyMediaState("NONE")

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
                            // Denotes whether or not the file being processed is the first file or not
                        let firstFile: boolean = true

                        // For each of the files the user has dragged into the div
                        for (const draggedSystemFile of event.dataTransfer.files ){

                            // The final "." represents the seperator of the file name and file format
                            const endOfFileName = draggedSystemFile.name.lastIndexOf(".")
                            const fileName = draggedSystemFile.name.substring(0, endOfFileName)
                            const fileFormat = draggedSystemFile.name.substring(endOfFileName+1, draggedSystemFile.name.length)

                            // Find the type of file based on the file format
                                // This will never be `null` (fingers crossed) since invalid file types would not be allowed to be dragged in
                            const fileType = FileFormatMapper(fileFormat)

                            // Open the file and read its data
                            const reader = new FileReader()
                            reader.readAsDataURL(draggedSystemFile)

                            // Checks if the file being processed is the first file or not
                                // The first file must open in the MediaViewer that files were dragged into
                            if (firstFile){
                                reader.onload = ()=>{
                                    // Update currentFile with the data from the file
                                    setCurrentFile({name: fileName, content:{type:fileType!, hidden:false, data:reader.result as string}})
                                }
                                firstFile = false
                            }

                            // If not, this means that another MediaViewer must be opened for the file
                            else{
                                reader.onload = ()=>{
                                    // Open a new MediaViewer with the new file as its props
                                    runningAppsDispatch({type:"ADD", app_name:"MediaViewer",  props:{fileContent:{type:fileType!, hidden:false, data:reader.result as string}, fileName:fileName} as MediaViewerProps})

                                }
                            }

                        }  
                        event.preventDefault()
                    }
                }}
                >
                    {{
                        "NONE": 
                            (<>
                                No media loaded...
                                <br />
                                Please open a file through the File Explorer
                                <br />
                                Or drag and drop a file from the File Explorer
                                <br />
                                Or drag and drop a file from your computer 
                            </>),
                        "VALID-DROP":
                            (<div className="drop valid-drop">
                                Drop to open file(s)
                            </div>),
                        "INVALID-DROP":
                            (<div className="drop invalid-drop">
                                Files invalid
                                <br />
                                One or more files are in an unsupported format
                            </div>)
                    }[emptyMediaState]}
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