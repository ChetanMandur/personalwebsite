import { useContext, useEffect, useState } from "react"
import "./FileExplorer.css"
import { MyFileSystem, MyFileSystemFile, MyFileSystemFolder } from "./MyFileSystem"
import { ContextMenuContext, ContextMenuOptions, contextMenuPropagation } from "../../Desktop/Contexts/ContextMenuContext"
import { AppRunningID, RunningAppsContext } from "../../Desktop/Contexts/RunningAppsContext"
import { MediaViewerProps } from "../MediaViewer/MediaViewer"
import { pathClean, doesPathExist, pathToArray, arrayToPath, folderItemType, fileThumbnailGetter, getParentPath } from "./FileExplorerHelpers"
import { TooltipContext } from "../../Desktop/Contexts/TooltipContext"

export type FileExplorerProps = AppRunningID & {
    path: string
}

type FolderEntry = [string, MyFileSystemFolder | MyFileSystemFile | boolean]

type CurrentFolder = {
    path: string,
    content: FolderEntry[]
}

export default function FileExplorer({path, app_running_id}:FileExplorerProps){
    const [addressBoxPath, setAddressBoxPath] = useState<string>("")
    const [currentFolder, setCurrentFolder] = useState<CurrentFolder>({path:"", content:[]})

    const [selected, setSelected] = useState<string>("")
    const [showHidden, setShowHidden] = useState<boolean>(false)

    const [showPathSuggestions, setShowPathSuggestions] = useState<boolean>(false)
    const [currentPathSuggestions, setCurrentPathSuggestions] = useState<[string, "FILE"|"FOLDER"][]|"EMPTY"|"FILE"|"ERROR">([])
    const [highlightPathSuggestion, setHighlightPathSuggestion] = useState<number>(-1)

    const {contextMenuDispatch} = useContext(ContextMenuContext)
    const {runningAppsDispatch} = useContext(RunningAppsContext)
    const {tooltipDispatch} = useContext(TooltipContext)
    

    useEffect(()=>{
        if (path !=undefined){
            const pathCleaned:string = pathClean(path)

            const [pathObject, pathResponse] = doesPathExist(pathCleaned)

            if (pathObject != null){
                if (pathResponse == "FOLDER"){
                    setCurrentFolder({path: pathCleaned, content: Object.entries(pathObject as MyFileSystemFolder)})
                    setAddressBoxPath(pathCleaned)
                    runningAppsDispatch({type:"UPDATE-APP-ADDITIONAL-TITLE", app_running_id:app_running_id, appAdditionalTitle: pathToArray(pathCleaned).pop()!})

                } else{
                    runningAppsDispatch({type:"ADD", app_name:"MediaViewer", props:{fileData:(pathObject as MyFileSystemFile), name:pathToArray(path).pop()!} as MediaViewerProps})
                    pathEnter(getParentPath(pathCleaned))
                    setSelected("")
                }
            }
            else{
                setAddressBoxPath("/")
                setCurrentFolder({path: "/", content: Object.entries(MyFileSystem)})
            }
        } else{
            setAddressBoxPath("/")
            setCurrentFolder({path: "/", content: Object.entries(MyFileSystem)})
        }
    },[])


    //Given a path, try and enter
    function pathEnter(path:string){
        path = pathClean(path)
        const [pathObject, pathResponse] =  doesPathExist(path)

        if (pathObject == null){
            alert(`The path ${path} does not exist.` )
            setAddressBoxPath(currentFolder.path)
        } 
        else{
            if (pathResponse == "FILE"){
                runningAppsDispatch({type:"ADD", app_name:"MediaViewer",  props:{fileData:(pathObject as MyFileSystemFile), name:pathToArray(path).pop()!} as MediaViewerProps})
                pathEnter(getParentPath(path))
                setShowPathSuggestions(false)
            } 
            else if (pathResponse == "FOLDER"){
                setAddressBoxPath(path)
                setCurrentFolder({path: path, content: Object.entries(pathObject)})
                runningAppsDispatch({type:"UPDATE-APP-ADDITIONAL-TITLE", app_running_id:app_running_id,appAdditionalTitle: pathToArray(path).pop()!})

                RenderPathSuggestions(path)
                setSelected("")
            }
        }
    }
         
    //Key handler for address bar
    function addressKeyHandler(event: React.KeyboardEvent<HTMLInputElement>){
        switch (event.key) {
            case "Enter":
                pathEnter(addressBoxPath)
                event.currentTarget.blur()
                break;

            case "ArrowUp":
                event.preventDefault()
                if (typeof currentPathSuggestions != "string"){
                    if (-1 < highlightPathSuggestion && highlightPathSuggestion <= currentPathSuggestions!.length){
                        setHighlightPathSuggestion(highlightPathSuggestion-1)
                        if (highlightPathSuggestion -1 == -1){
                            setAddressBoxPath(currentFolder.path)
                        } else{
                            setAddressBoxPath(currentPathSuggestions![highlightPathSuggestion-1][0])
                        }
                    } 
                    else if (highlightPathSuggestion == -1){
                        setHighlightPathSuggestion(currentPathSuggestions!.length-1)
                        setAddressBoxPath(currentPathSuggestions![currentPathSuggestions!.length-1][0])
    
                    }
                } else{
                    setHighlightPathSuggestion( (highlightPathSuggestion != -1 ? (-1):(0)) )
                }
                break;

            case "ArrowDown":
                event.preventDefault()
                if (typeof currentPathSuggestions != "string"){
                    if (-1 <= highlightPathSuggestion && highlightPathSuggestion < currentPathSuggestions!.length-1){
                        setHighlightPathSuggestion(highlightPathSuggestion+1)
                        setAddressBoxPath(currentPathSuggestions![highlightPathSuggestion+1][0])
                    } else if (highlightPathSuggestion == currentPathSuggestions!.length-1){
                        setHighlightPathSuggestion(-1)
                        setAddressBoxPath(currentFolder.path)
                    }
                }else{
                    setHighlightPathSuggestion( (highlightPathSuggestion != -1 ? (-1):(0)) )
                }
                break;
            
            case "ArrowRight":
                
                    if (highlightPathSuggestion != -1){
                        if (typeof currentPathSuggestions != "string"){
                            event.preventDefault()
                            pathEnter(currentPathSuggestions![highlightPathSuggestion][0])
                            if (currentPathSuggestions![highlightPathSuggestion][1] == "FILE"){
                                event.currentTarget.blur()
                            } else{
                                setHighlightPathSuggestion(0)
                            }
                        } else {
                            if (currentPathSuggestions != "ERROR"){
                                event.currentTarget.blur()
                            }
                        }
                    }
                
                break;

            case "ArrowLeft":
                if (highlightPathSuggestion != -1){
                    event.preventDefault()
                    pathEnter(getParentPath(currentFolder.path))
                    setHighlightPathSuggestion(0)
                }
                break;
        
            default:
                if (highlightPathSuggestion != -1){
                    setHighlightPathSuggestion(-1)
                }
                break;
        }
    }


    //Handler for when back button is pressed
    function backButtonPressed(){
        const pathArray = pathToArray(currentFolder.path)
        if (pathArray.length != 0){
            pathArray.pop()
            const newPath = arrayToPath(pathArray)

            pathEnter(newPath)
        }
    }


    //Handler when item is pressed
    function itemClickedHandler(item: FolderEntry, event: React.MouseEvent<HTMLDivElement, MouseEvent>){
        event.stopPropagation();
        if (selected != item[0]){
            setSelected(item[0])
        }
    }

    //Handler when item is double clicked (ie. user opens item)
    function itemDoubleClickedHandler(item: FolderEntry, event: React.MouseEvent<HTMLDivElement, MouseEvent>){
        event.stopPropagation();
        switch(folderItemType(item[1])){
            case "FOLDER":{
                pathEnter(currentFolder.path + "/" +item[0])
                break;

            }
            case "FILE":{
                // runningAppsDispatch({type:"ADD", app_name:"MediaViewer",  props:{data:(item[1] as MyFileSystemFile).data, type:(item[1] as MyFileSystemFile).type} as MediaViewerProps})
                pathEnter(currentFolder.path + "/" +item[0])
                setSelected("")
                break;
            }
            default:{
                break;
            }
        }
    }

    const toggleHiddenFilesContextMenu = {} as ContextMenuOptions
    if (!showHidden){
        toggleHiddenFilesContextMenu["Show hidden files"] = ()=>{setShowHidden(true)}
    } else{
        toggleHiddenFilesContextMenu["Hide hidden files"] = ()=>{setShowHidden(false)}

    }


    //Function for rendering path suggestions given a path (if no path given, use addressBoxPath)
    function RenderPathSuggestions(path?:string){
        //If a path is not given, use the path in addressBox
        if (path == undefined){
            path = addressBoxPath
        }

        //Clean path and find pathArray
        path = pathClean(path)
        const pathArray = pathToArray(path)


        //Check current path, see if it exists
        const [pathObject, pathResponse] = doesPathExist(path)

        //If it does exist (a complete path) then find all folders within path and display
        if (pathObject != null){
            if (pathResponse == "FOLDER"){
                //Filter content to find folders
                const filesInPath = Object.entries(pathObject).filter(
                    (item)=>{
                        if ((item[1] as MyFileSystemFile|MyFileSystemFolder).hidden && !showHidden){
                            return false
                        }
                        const itemType = folderItemType(item[1])
                        return (( itemType == "FOLDER" || itemType=="FILE" ))
                    }
                )

                if (filesInPath.length != 0){
                    //Construct new path suggestions based on filtered content
                    const newPathSuggestions:typeof currentPathSuggestions = []
                    for (const i of filesInPath){
                        if (pathArray.length == 0){
                            //If pathArray is 0, that means path = "/"
                            if (folderItemType(i[1]) == "FOLDER"){
                                newPathSuggestions.push([path + i[0], "FOLDER"])
                            } else {
                                newPathSuggestions.push([path + i[0], "FILE"])
                            }
                        } else{
                            if (folderItemType(i[1]) == "FOLDER"){
                                newPathSuggestions.push([path + "/" + i[0], "FOLDER"])
                            } else {
                                newPathSuggestions.push([path + "/" + i[0], "FILE"])
                            }
                        }
                    }
                    setCurrentPathSuggestions(newPathSuggestions)
                } else{
                    setCurrentPathSuggestions("EMPTY")
                }
            }
            else{
                setCurrentPathSuggestions("FILE")
            }

        }

        //If it doesnt exist (either incomplete name/doesnt exist)
        else{
            // Find child
            const incompleteChild = pathArray.pop() //incompleteChild = last item in pathArray

            // Find parent path
            const parentPath = arrayToPath(pathArray) //parentPath = pathArray - last item

            //Check to see if parent exists
            const [parentObject, parentResponse] = doesPathExist(parentPath)

            //If parent exists, show folders that are close to the incomplete child
            if (parentObject != null && parentResponse == "FOLDER"){
                const filesInPath = Object.entries(parentObject).filter(
                    (item)=>{
                        if ((item[1] as MyFileSystemFile|MyFileSystemFolder).hidden && !showHidden){
                            return false
                        }
                        const itemType = folderItemType(item[1])
                        return ((itemType == "FOLDER" || itemType == "FILE") && (item[0].substring(0, incompleteChild?.length) == incompleteChild) )
                    }
                )

                //Construct new path suggestions based on filtered content
                const newPathSuggestions:typeof currentPathSuggestions = []
                for (const i of filesInPath){
                    if (pathArray.length == 0){
                        //If pathArray is 0, that means path = "/"
                        if (folderItemType(i[1]) == "FOLDER"){
                            newPathSuggestions.push([parentPath + i[0], "FOLDER"])
                        }
                        else {
                            newPathSuggestions.push([parentPath + i[0], "FILE"])
                        }
                    } else{
                        if (folderItemType(i[1]) == "FOLDER"){
                            newPathSuggestions.push([parentPath + "/" + i[0], "FOLDER"])
                        }
                        else {
                            newPathSuggestions.push([parentPath + "/" + i[0], "FILE"])
                        }
                    }
                }
                if (newPathSuggestions.length == 0){
                    setCurrentPathSuggestions("ERROR")
                }else{
                    setCurrentPathSuggestions(newPathSuggestions)

                }

            }
            //If parent doesnt exist, show no suggestions (not sure if this is really needed tbh, and i dont wanna test rn)
            else {
                setCurrentPathSuggestions("ERROR")
            }
        }

    }

    
    return(
    <div className="file-explorer">
        <div className="menu-bar"> 
            <div className="back-button" onMouseDown={(event)=>{event.preventDefault();backButtonPressed()}}>
                <img src="https://www.svgrepo.com/show/500777/back.svg" />
            </div>
            <input type="text" onFocus={()=>{setShowPathSuggestions(true); RenderPathSuggestions(); setHighlightPathSuggestion(-1)}} onBlur={()=>{setShowPathSuggestions(false)}} spellCheck="false"  autoComplete="off" value={addressBoxPath} onKeyDown={(event)=>{addressKeyHandler(event)}} onChange={(event)=>{setAddressBoxPath(event.target.value); RenderPathSuggestions(event.target.value)}} name="address-box" id="" />
            {showPathSuggestions ? 
                <div className="path-suggestion">
                    {
                        typeof currentPathSuggestions == "string" ?
                        (
                            <div className={"path-suggestion-message " + (highlightPathSuggestion==0 ? "path-suggestion-item-active": "")} 
                            onMouseMove={()=>{setHighlightPathSuggestion(0)}} 
                            onMouseLeave={()=>{setHighlightPathSuggestion(-1)}}>
                                {currentPathSuggestions == "FILE" ? ("Path leads to a file") : (currentPathSuggestions == "EMPTY" ? ("This path is empty"):("Path error"))}
                            </div>
                        )
                        :
                        (
                            currentPathSuggestions.map( (item, index)=>{
                                return (
                                    <div key={item[0]+"pathSuggestionItem"} 
                                        className={"path-suggestion-item " + (highlightPathSuggestion==index ? "path-suggestion-item-active": "")} 
                                        onMouseDown={(event)=>{event.preventDefault();pathEnter(item[0])}} 
                                        onMouseMove={()=>{setHighlightPathSuggestion(index);setAddressBoxPath(item[0])}} 
                                        onMouseLeave={()=>{setHighlightPathSuggestion(-1);setAddressBoxPath(currentFolder.path)}}>
                                            {item[0]} 
                                            <div className="path-suggestion-item-type">{(item[1] == "FOLDER" ? "(Folder)" : "(File)")}</div>
                                    </div>
                                )
                            })
                        )
                    }
                </div> 
                : 
                <></>
            }
        </div>
        <div className="folder-content" 
            onClick={()=>{setSelected("")}} 
            onContextMenu={(event)=>{
                contextMenuPropagation(event); 
                setSelected("");
                contextMenuDispatch({type:"SET",event:event, newOptions:toggleHiddenFilesContextMenu});
            }}
        >
            {
                currentFolder.content.map ( (item) =>{
                    const itemType = folderItemType(item[1])

                    if (itemType == "BOOLEAN"){
                        return(null)
                    }
                    const itemStyle = (selected == item[0]) ? ("selected") : ("")

                    if ((item[1] as MyFileSystemFile|MyFileSystemFolder).hidden && !showHidden){
                        return null
                    }
                    
                    return(
                        <div className={"item " + itemStyle} key={item[0]+"contentItem"} 
                            onContextMenu={(event)=>{
                                if (itemType == "FOLDER"){
                                    contextMenuPropagation(event)
                                    setSelected(item[0]);
                                    contextMenuDispatch({
                                        type: "SET",
                                        event: event,
                                        newOptions:{
                                            "Open in the background": ()=>{
                                                runningAppsDispatch({
                                                    type:"ADD",
                                                    app_name:"FileExplorer",
                                                    props: {
                                                        path: currentFolder.path + "/" + item[0]
                                                    } as FileExplorerProps
                                                });
                                                runningAppsDispatch({
                                                    type:"UPDATE-APP-FOCUS",
                                                    app_running_id: app_running_id
                                                })
                                            },
                                            "Open in new window": ()=>{
                                                runningAppsDispatch({
                                                    type:"ADD",
                                                    app_name:"FileExplorer",
                                                    props: {
                                                        path: currentFolder.path + "/" + item[0]
                                                    } as FileExplorerProps
                                                });
                                            },
                                            
                                        } as ContextMenuOptions
                                    })
                                }
                            }}  
                            onClick={(event)=>{itemClickedHandler(item, event); tooltipDispatch({type:"HIDE"});}} 
                            onDoubleClick={(event)=>{itemDoubleClickedHandler(item,event)}}
                            onMouseMove={(event)=>{tooltipDispatch({type:"SET", event: event, newData:item[0], newDataType:"TEXT"})}}
                            onMouseOut={()=>{tooltipDispatch({type:"HIDE"});}}
                        >
                            {/* goated  */}
                            <div className="icon">{(itemType == "FILE") ? <img src={fileThumbnailGetter((item[1] as MyFileSystemFile).type as MyFileSystemFile["type"])}/> : <img src="https://www.svgrepo.com/show/535397/folder-open.svg"/>}</div>
                            <div className="name">{(item[0])}</div>
                        </div>
                    )
                })
            }
        </div>
    </div>
    )
}