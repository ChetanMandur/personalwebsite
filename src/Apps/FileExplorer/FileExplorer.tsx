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

type PathSuggestion = {
    display: boolean,
    highlight: number,
    content: [string, "FILE"|"FOLDER"][]| //For when path leads to a folder w/ items, an array of 
            "EMPTY"| //For when path leads to a folder w/o items
            "FILE"| //For when path leads to a file
            "ERROR" //For when the path leads to no where, the unknown, or to nothingness.... the path given is such of one that does not exist: a fools journey. Only those fearless or unwise would dare to even attempt to wander
}

export default function FileExplorer({path, app_running_id}:FileExplorerProps){
    const [addressBox, setAddressBox] = useState<string>("")
    const [currentFolder, setCurrentFolder] = useState<CurrentFolder>({path:"", content:[]})

    const [selected, setSelected] = useState<string>("")
    const [showHidden, setShowHidden] = useState<boolean>(false)

    const [pathSuggestion, setPathSuggestion] = useState<PathSuggestion>({display:false, highlight: -1, content: []})

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
                    setAddressBox(pathCleaned)
                    runningAppsDispatch({type:"UPDATE-APP-ADDITIONAL-TITLE", app_running_id:app_running_id, appAdditionalTitle: pathToArray(pathCleaned).pop()!})

                } else{
                    runningAppsDispatch({type:"ADD", app_name:"MediaViewer", props:{fileData:(pathObject as MyFileSystemFile), name:pathToArray(path).pop()!} as MediaViewerProps})
                    pathEnter(getParentPath(pathCleaned))
                    setSelected("")
                }
            }
            else{
                setAddressBox("/")
                setCurrentFolder({path: "/", content: Object.entries(MyFileSystem)})
            }
        } else{
            setAddressBox("/")
            setCurrentFolder({path: "/", content: Object.entries(MyFileSystem)})
        }
    },[])

    //Given a path, try and enter
    function pathEnter(path:string){
        path = pathClean(path)
        const [pathObject, pathResponse] =  doesPathExist(path)

        if (pathObject == null){
            alert(`The path ${path} does not exist.` )
            setAddressBox(currentFolder.path)
        } 
        else{
            if (pathResponse == "FILE"){
                runningAppsDispatch({type:"ADD", app_name:"MediaViewer",  props:{fileData:(pathObject as MyFileSystemFile), name:pathToArray(path).pop()!} as MediaViewerProps})
                pathEnter(getParentPath(path))
                setPathSuggestion(pendingState=>({...pendingState, display: false}))
            } 
            else if (pathResponse == "FOLDER"){
                setAddressBox(path)
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
                pathEnter(addressBox)
                event.currentTarget.blur()
                break;

            case "ArrowUp":
                event.preventDefault()
                if (typeof pathSuggestion.content != "string"){
                    if (-1 < pathSuggestion.highlight && pathSuggestion.highlight <= pathSuggestion.content.length){
                        setPathSuggestion(pendingState =>({...pendingState, highlight: pendingState.highlight - 1}))
                        if (pathSuggestion.highlight -1 == -1){
                            setAddressBox(currentFolder.path)
                        } else{
                            setAddressBox(pathSuggestion.content[pathSuggestion.highlight-1][0])
                        }
                    } 
                    else if (pathSuggestion.highlight == -1){
                        setPathSuggestion(pendingState => ({...pendingState, highlight: pendingState.content.length - 1}))
                        setAddressBox(pathSuggestion.content[pathSuggestion.content.length-1][0])
    
                    }
                } else{
                    setPathSuggestion(pendingState => ({...pendingState, highlight: ((pendingState.highlight != -1) ? (-1) : (0))}))
                }
                break;

            case "ArrowDown":
                event.preventDefault()
                if (typeof pathSuggestion.content != "string"){
                    if (-1 <= pathSuggestion.highlight && pathSuggestion.highlight < pathSuggestion.content.length-1){
                        setPathSuggestion(pendingState => ({...pendingState, highlight: pendingState.highlight+1}))
                        setAddressBox(pathSuggestion.content[pathSuggestion.highlight+1][0])
                    } else if (pathSuggestion.highlight == pathSuggestion.content.length-1){
                        setPathSuggestion(pendingState => ({...pendingState, highlight: -1}))
                        setAddressBox(currentFolder.path)
                    }
                }else{
                    setPathSuggestion(pendingState => ({...pendingState, highlight: ((pendingState.highlight != -1) ? (-1) : (0))}))
                }
                break;
            
            case "ArrowRight":
                
                    if (pathSuggestion.highlight != -1){
                        if (typeof pathSuggestion.content != "string"){
                            event.preventDefault()
                            pathEnter(pathSuggestion.content[pathSuggestion.highlight][0])
                            if (pathSuggestion.content[pathSuggestion.highlight][1] == "FILE"){
                                event.currentTarget.blur()
                            } else{
                                setPathSuggestion(pendingState => ({...pendingState, highlight: 0}))
                            }
                        } else {
                            if (pathSuggestion.content != "ERROR"){
                                event.currentTarget.blur()
                            }
                        }
                    }
                
                break;

            case "ArrowLeft":
                if (pathSuggestion.highlight != -1){
                    event.preventDefault()
                    pathEnter(getParentPath(currentFolder.path))
                    setPathSuggestion(pendingState =>({...pendingState, highlight: 0}))
                }
                break;
        
            default:
                if (pathSuggestion.highlight != -1){
                    setPathSuggestion(pendingState => ({...pendingState, highlight: -1}))
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
            path = addressBox
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
                    const newPathSuggestionContent:PathSuggestion["content"] = []
                    for (const i of filesInPath){
                        if (pathArray.length == 0){
                            //If pathArray is 0, that means path = "/"
                            if (folderItemType(i[1]) == "FOLDER"){
                                newPathSuggestionContent.push([path + i[0], "FOLDER"])
                            } else {
                                newPathSuggestionContent.push([path + i[0], "FILE"])
                            }
                        } else{
                            if (folderItemType(i[1]) == "FOLDER"){
                                newPathSuggestionContent.push([path + "/" + i[0], "FOLDER"])
                            } else {
                                newPathSuggestionContent.push([path + "/" + i[0], "FILE"])
                            }
                        }
                    }
                    setPathSuggestion(pendingState => ({...pendingState, content: newPathSuggestionContent}))
                } else{
                    setPathSuggestion(pendingState => ({...pendingState, content: "EMPTY"}))
                }
            }
            else{
                setPathSuggestion(pendingState => ({...pendingState, content: "FILE"}))
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
                const newPathSuggestionsContent:PathSuggestion["content"] = []
                for (const i of filesInPath){
                    if (pathArray.length == 0){
                        //If pathArray is 0, that means path = "/"
                        if (folderItemType(i[1]) == "FOLDER"){
                            newPathSuggestionsContent.push([parentPath + i[0], "FOLDER"])
                        }
                        else {
                            newPathSuggestionsContent.push([parentPath + i[0], "FILE"])
                        }
                    } else{
                        if (folderItemType(i[1]) == "FOLDER"){
                            newPathSuggestionsContent.push([parentPath + "/" + i[0], "FOLDER"])
                        }
                        else {
                            newPathSuggestionsContent.push([parentPath + "/" + i[0], "FILE"])
                        }
                    }
                }
                if (newPathSuggestionsContent.length == 0){
                    setPathSuggestion(pendingState => ({...pendingState, content:"ERROR"}))
                }else{
                    setPathSuggestion(pendingState => ({...pendingState, content: newPathSuggestionsContent}))

                }

            }
            //If parent doesnt exist, show no suggestions (not sure if this is really needed tbh, and i dont wanna test rn)
            else {
                setPathSuggestion(pendingState => ({...pendingState, content:"ERROR"}))
            }
        }

    }

    
    return(
    <div className="file-explorer">
        <div className="menu-bar"> 
            <div className="back-button" onMouseDown={(event)=>{event.preventDefault();backButtonPressed()}}>
                <img src="https://www.svgrepo.com/show/500777/back.svg" />
            </div>
            <input type="text" 
                onFocus={()=>{
                    setPathSuggestion(pendingState =>({...pendingState, display:true, highlight:-1}))
                    RenderPathSuggestions(); 
                }} 
                onBlur={()=>{
                    setPathSuggestion(pendingState => ({...pendingState, display: false}))
                }} 
                spellCheck="false"  
                autoComplete="off" 
                value={addressBox} 
                onKeyDown={(event)=>{
                    addressKeyHandler(event)
                }} 
                onChange={(event)=>{
                    setAddressBox(event.target.value); 
                    RenderPathSuggestions(event.target.value)
                }} 
                name="address-box" id="" 
            />

            {pathSuggestion.display ? 
                <div className="path-suggestion">
                    {
                        typeof pathSuggestion.content == "string" ?
                        (
                            <div className={"path-suggestion-message " + (pathSuggestion.highlight==0 ? "path-suggestion-item-active": "")} 
                            onMouseMove={()=>{
                                setPathSuggestion(pendingState => ({...pendingState, highlight:0}))
                            }} 
                            onMouseLeave={()=>{
                                setPathSuggestion(pendingState => ({...pendingState, highlight:-1}))
                            }}>
                                {pathSuggestion.content == "FILE" ? ("Path leads to a file") : (pathSuggestion.content == "EMPTY" ? ("This path is empty"):("Path error"))}
                            </div>
                        )
                        :
                        (
                            pathSuggestion.content.map( (item, index)=>{
                                return (
                                    <div key={item[0]+"pathSuggestionItem"} 
                                        className={"path-suggestion-item " + (pathSuggestion.highlight==index ? "path-suggestion-item-active": "")} 
                                        onMouseDown={(event)=>{event.preventDefault();pathEnter(item[0])}} 
                                        onMouseMove={()=>{
                                            setPathSuggestion(pendingState => ({...pendingState, highlight:index}))
                                            setAddressBox(item[0])
                                        }} 
                                        onMouseLeave={()=>{
                                            setPathSuggestion(pendingState => ({...pendingState, highlight: -1}))
                                            setAddressBox(currentFolder.path)
                                        }}>
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