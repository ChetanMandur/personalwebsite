import { useContext, useEffect, useState } from "react"
import "./FileExplorer.css"
import { MyFileSystem, MyFileSystemFile, MyFileSystemFolder } from "./MyFileSystem"
import { ContextMenuContext, ContextMenuOptions, contextMenuPropagation } from "../../Desktop/Contexts/ContextMenuData"
import { RunningAppsContext } from "../../Desktop/Contexts/RunningApps"
import { AppList } from "../Apps"
import { MediaViewerProps } from "../MediaViewer/MediaViewer"
import { pathClean, doesPathExist, pathToArray, arrayToPath, folderItemType, fileThumbnailGetter, getParentPath } from "./FileExplorerHelpers"

export type FileExplorerProps = {
    path: string
}

export default function FileExplorer({path}:FileExplorerProps){
    const [currentPath, setCurrentPath] = useState<string>("")
    const [addressBoxPath, setAddressBoxPath] = useState<string>("")
    const [currentFolder, setCurrentFolder] = useState<[string, MyFileSystemFolder | MyFileSystemFile | boolean][]>([])

    const [selected, setSelected] = useState<string>("")
    const [showHidden, setShowHidden] = useState<boolean>(false)

    const [showPathSuggestions, setShowPathSuggestions] = useState<boolean>(false)
    const [currentPathSuggestions, setCurrentPathSuggestions] = useState<[string, "FILE"|"FOLDER"][]|"EMPTY"|"FILE"|"ERROR">([])
    const [highlightPathSuggestion, setHighlightPathSuggestion] = useState<number>(-1)

    const {contextMenuDispatch} = useContext(ContextMenuContext)
    const {runningAppsDispatch} = useContext(RunningAppsContext)

    useEffect(()=>{
        if (path !=undefined){
            let pathCleaned:string = pathClean(path)

            const [pathObject, pathResponse] = doesPathExist(pathCleaned)

            if (pathObject != null){
                if (pathResponse == "FOLDER"){
                    setCurrentPath(pathCleaned)
                    setAddressBoxPath(pathCleaned)
                    setCurrentFolder(Object.entries(pathObject as MyFileSystemFolder))

                } else{
                    runningAppsDispatch({type:"ADD", app_name:"MediaViewer", app_properties: AppList["MediaViewer"], props:{data:(pathObject as MyFileSystemFile).data, type:(pathObject as MyFileSystemFile).type} as MediaViewerProps})
                    pathEnter(getParentPath(pathCleaned))
                    setSelected("")
                }
            }
            else{
                setCurrentPath("/")
                setAddressBoxPath("/")
                setCurrentFolder(Object.entries(MyFileSystem))
            }
        } else{
            setCurrentPath("/")
            setAddressBoxPath("/")
            setCurrentFolder(Object.entries(MyFileSystem))
        }
    },[])


    //Given a path, try and enter
    function pathEnter(path:string){
        path = pathClean(path)
        const [pathObject, pathResponse] =  doesPathExist(path)

        if (pathObject == null){
            alert(`The path ${path} does not exist.` )
            setAddressBoxPath(currentPath)
        } 
        else{
            if (pathResponse == "FILE"){
                runningAppsDispatch({type:"ADD", app_name:"MediaViewer", app_properties: AppList["MediaViewer"], props:{data:(pathObject as MyFileSystemFile).data, type:(pathObject as MyFileSystemFile).type} as MediaViewerProps})
                pathEnter(getParentPath(path))
                setShowPathSuggestions(false)
            } 
            else if (pathResponse == "FOLDER"){
                setCurrentPath(path)
                setAddressBoxPath(path)
                setCurrentFolder(Object.entries(pathObject))
                setSelected("")
            }
        }
    }
         

    //Given a folder name, try to enter from currentPath
    function folderEnter(folderName:string){
        let pathArray = pathToArray(currentPath)
        pathArray.push(folderName)
        let newPath = arrayToPath(pathArray)

        const [pathObject] = doesPathExist(newPath)

        setAddressBoxPath(newPath)
        setCurrentPath(newPath)
        setCurrentFolder(Object.entries(pathObject as MyFileSystemFolder))
        setSelected("")
    }

    //Key handler for address bar
    function onAddressSubmit(event: React.KeyboardEvent<HTMLInputElement>){
        switch (event.key) {
            case "Enter":
                pathEnter(addressBoxPath)
                event.currentTarget.blur()
                break;

            case "ArrowUp":
                event.preventDefault()
                if (-1 < highlightPathSuggestion && highlightPathSuggestion <= currentPathSuggestions!.length){
                    setHighlightPathSuggestion(highlightPathSuggestion-1)
                    if (highlightPathSuggestion -1 == -1){
                        setAddressBoxPath(currentPath)
                    } else{
                        setAddressBoxPath(currentPathSuggestions![highlightPathSuggestion-1][0])
                    }
                }
                break;

            case "ArrowDown":
                event.preventDefault()
                if (-1 <= highlightPathSuggestion && highlightPathSuggestion < currentPathSuggestions!.length-1){
                    setHighlightPathSuggestion(highlightPathSuggestion+1)
                    setAddressBoxPath(currentPathSuggestions![highlightPathSuggestion+1][0])
                }
                break;
            
            case "ArrowRight":
                if (highlightPathSuggestion != -1){
                    event.preventDefault()
                    pathEnter(currentPathSuggestions![highlightPathSuggestion][0])
                    RenderPathSuggestions(currentPathSuggestions![highlightPathSuggestion][0])
                    setHighlightPathSuggestion(0)
                }
                break;

            case "ArrowLeft":
                if (highlightPathSuggestion != -1){
                    event.preventDefault()
                    pathEnter(getParentPath(currentPath))
                    RenderPathSuggestions(getParentPath(currentPath))
                    setHighlightPathSuggestion(0)
                }
                break;
        
            default:
                break;
        }
    }


    //Handler for when back button is pressed
    function backButtonPressed(){
        let pathArray = pathToArray(currentPath)
        if (pathArray.length != 0){
            pathArray.pop()
            let newPath = arrayToPath(pathArray)

            const [pathObject] = doesPathExist(newPath)


            setAddressBoxPath(newPath)
            setCurrentPath(newPath)
            setCurrentFolder(Object.entries(pathObject as MyFileSystemFolder))
            setSelected("")
        }
    }


    //Handler when item is pressed
    function itemClickedHandler(item: [string, MyFileSystemFolder | MyFileSystemFile |boolean], event: React.MouseEvent<HTMLDivElement, MouseEvent>){
        event.stopPropagation();
        if (selected != item[0]){
            setSelected(item[0])
        }
    }

    //Handler when item is double clicked (ie. user opens item)
    function itemDoubleClickedHandler(item: [string, MyFileSystemFolder | MyFileSystemFile | boolean], event: React.MouseEvent<HTMLDivElement, MouseEvent>){
        event.stopPropagation();
        switch(folderItemType(item[1])){
            case "FOLDER":{
                folderEnter(item[0])
                break;

            }
            case "FILE":{
                runningAppsDispatch({type:"ADD", app_name:"MediaViewer", app_properties: AppList["MediaViewer"], props:{data:(item[1] as MyFileSystemFile).data, type:(item[1] as MyFileSystemFile).type} as MediaViewerProps})
                setSelected("")
                break;
            }
            default:{
                break;
            }
        }
    }

    let toggleHiddenFilesContextMenu = {} as ContextMenuOptions
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
        let pathArray = pathToArray(path)


        //Check current path, see if it exists
        const [pathObject, pathResponse] = doesPathExist(path)

        //If it does exist (a complete path) then find all folders within path and display
        if (pathObject != null){
            if (pathResponse == "FOLDER"){
                //Filter content to find folders
                let filesInPath = Object.entries(pathObject).filter(
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
                    let newPathSuggestions:typeof currentPathSuggestions = []
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
            let incompleteChild = pathArray.pop() //incompleteChild = last item in pathArray

            // Find parent path
            let parentPath = arrayToPath(pathArray) //parentPath = pathArray - last item

            //Check to see if parent exists
            const [parentObject, parentResponse] = doesPathExist(parentPath)

            //If parent exists, show folders that are close to the incomplete child
            if (parentObject != null && parentResponse == "FOLDER"){
                let filesInPath = Object.entries(parentObject).filter(
                    (item)=>{
                        if ((item[1] as MyFileSystemFile|MyFileSystemFolder).hidden && !showHidden){
                            return false
                        }
                        const itemType = folderItemType(item[1])
                        return ((itemType == "FOLDER" || itemType == "FILE") && (item[0].substring(0, incompleteChild?.length) == incompleteChild) )
                    }
                )

                //Construct new path suggestions based on filtered content
                let newPathSuggestions:typeof currentPathSuggestions = []
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
            <div className="back-button" onClick={()=>{backButtonPressed()}}>
                <img src="https://www.svgrepo.com/show/500777/back.svg" />
            </div>
            <input type="text" onFocus={()=>{setShowPathSuggestions(true); RenderPathSuggestions(); setHighlightPathSuggestion(-1)}} onBlur={()=>{setShowPathSuggestions(false);RenderPathSuggestions()}} spellCheck="false"  autoComplete="off" value={addressBoxPath} onKeyDown={(event)=>{onAddressSubmit(event)}} onChange={(event)=>{setAddressBoxPath(event.target.value); RenderPathSuggestions(event.target.value)}} name="address-box" id="" />
            {showPathSuggestions ? 
                <div className="path-suggestion">
                    {
                        typeof currentPathSuggestions == "string" ?
                        (
                            currentPathSuggestions == "FILE" ?
                            (
                                <div className="path-suggestion-message">Path leads to a file</div>
                            )
                            :
                            (
                                currentPathSuggestions == "EMPTY" ?
                                (
                                    <div className="path-suggestion-message">This path is empty</div>
                                )
                                :
                                (
                                    <div className="path-suggestion-message">Path error</div>
                                )
                            )
                        )
                        :
                        (
                            currentPathSuggestions.map( (item, index)=>{
                                return (
                                    <div key={item[0]} className={"path-suggestion-item " + (highlightPathSuggestion==index ? "path-suggestion-item-active": "")} onMouseDown={()=>{pathEnter(item[0])}} onMouseEnter={()=>{setHighlightPathSuggestion(-1)}} >{item[0]} <div className="path-suggestion-item-type">{(item[1] == "FOLDER" ? "(Folder)" : "(File)")}</div></div>
                                )
                            })
                        )
                    }
                </div> 
                : 
                <></>
            }
        </div>
        <div className="content" onClick={()=>{setSelected("")}} onContextMenu={(event)=>{contextMenuPropagation(event); 
            contextMenuDispatch({type:"SET",event:event, newOptions:toggleHiddenFilesContextMenu});
            contextMenuDispatch({type:"SHOW"})
        }}>
            {
                currentFolder.map ( (item) =>{
                    if (folderItemType(item[1]) == "BOOLEAN"){
                        return(null)
                    }
                    let itemStyle = (selected == item[0]) ? ("selected") : ("")

                    if ((item[1] as MyFileSystemFile|MyFileSystemFolder).hidden && !showHidden){
                        return null
                    }
                    
                    return(
                        <div className={"item " + itemStyle} key={item[0]} onClick={(event)=>(itemClickedHandler(item, event))} onDoubleClick={(event)=>{itemDoubleClickedHandler(item,event)}}>
                            {/* goated  */}
                            <div className="icon">{(folderItemType(item[1]) == "FILE") ? <img src={fileThumbnailGetter((item[1] as MyFileSystemFile).type as MyFileSystemFile["type"])}/> : <img src="https://www.svgrepo.com/show/535397/folder-open.svg"/>}</div>
                            <div className="name">{(item[0])}</div>
                        </div>
                    )
                })
            }
        </div>
    </div>
    )
}