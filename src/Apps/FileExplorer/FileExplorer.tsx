import { useContext, useEffect, useState } from "react"
import "./FileExplorer.css"
import { MyFileSystem, MyFileSystemFile, MyFileSystemFolder } from "./MyFileSystem"
import { ContextMenuContext, ContextMenuOptions, contextMenuPropagation } from "../../Desktop/Contexts/ContextMenuData"
import { RunningAppsContext } from "../../Desktop/Contexts/RunningApps"
import { AppList } from "../Apps"
import { MediaViewerProps } from "../MediaViewer/MediaViewer"
import { pathClean, doesPathExist, pathToArray, arrayToPath, folderItemType, fileThumbnailGetter } from "./FileExplorerHelpers"

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
    const [currentPathSuggestions, setCurrentPathSuggestions] = useState<[string, MyFileSystemFolder | MyFileSystemFile | boolean][]>([])

    const {contextMenuDispatch} = useContext(ContextMenuContext)
    const {runningAppsDispatch} = useContext(RunningAppsContext)

    useEffect(()=>{
        if (path !=undefined){
            let pathCleaned:string = pathClean(path)

            const pathExists:(MyFileSystemFolder|null|"FILE") = doesPathExist(pathCleaned)

            if (pathExists != null && pathExists != "FILE"){
                setCurrentPath(pathCleaned)
                setAddressBoxPath(pathCleaned)
                setCurrentFolder(Object.entries(pathExists as MyFileSystemFolder))
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

    function onAddressSubmit(event: React.KeyboardEvent<HTMLInputElement>){
        if(event.key == "Enter"){
            let pathCleaned:string = pathClean(addressBoxPath)

            const pathExists:(MyFileSystemFolder|null|"FILE") =  doesPathExist(pathCleaned)

            if (pathExists == null){
                alert(`The path ${pathCleaned} does not exist.` )
                setAddressBoxPath(currentPath)
            } else if (pathExists == "FILE"){
                alert(`The path ${pathCleaned} leads to a file` )
                setAddressBoxPath(currentPath)
            } else{
                setCurrentPath(pathCleaned)
                setAddressBoxPath(pathCleaned)
                setCurrentFolder(Object.entries(pathExists))
                setSelected("")
            }
            event.currentTarget.blur()
        }
    }

    function backButtonPressed(){
        let pathArray = pathToArray(currentPath)
        if (pathArray.length != 0){
            pathArray.pop()
            let newPath = arrayToPath(pathArray)

            setAddressBoxPath(newPath)
            setCurrentPath(newPath)
            setCurrentFolder(Object.entries(doesPathExist(newPath)!))
            setSelected("")
        }
    }

    function folderEnter(folderName:string){
        let pathArray = pathToArray(currentPath)
        pathArray.push(folderName)
        let newPath = arrayToPath(pathArray)

        setAddressBoxPath(newPath)
        setCurrentPath(newPath)
        setCurrentFolder(Object.entries(doesPathExist(newPath)!))
        setSelected("")
    }


    function itemClickedHandler(item: [string, MyFileSystemFolder | MyFileSystemFile |boolean], event: React.MouseEvent<HTMLDivElement, MouseEvent>){
        event.stopPropagation();
        if (selected != item[0]){
            setSelected(item[0])
        }
    }

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

    function RenderPathSuggestions(path?:string){
        //If a path is not given, use the path in addressBox
        if (path == undefined){
            path = addressBoxPath
        }

        //Check current path, see if it exists
        const currentCheck = doesPathExist(path)

        //If it does exist (a complete path) then find all folders within path and display
        if (currentCheck != null && currentCheck != "FILE"){

            setCurrentPathSuggestions(Object.entries(currentCheck).filter((item)=>{return folderItemType(item[1]) == "FOLDER"}))
        }

        //If it doesnt exist (either incomplete name/doesnt exist)
        else{
            // Find parent
            let pathArray = pathToArray(path)
            let incompleteChild = pathArray.pop() //parent path = current path - closest child

            //Check to see if parent exists
            const parentCheck = doesPathExist(arrayToPath(pathArray))

            //If parent exists, show folders that are close to the incomplete child
            if (parentCheck != null && parentCheck != "FILE"){
                setCurrentPathSuggestions(
                    Object.entries(parentCheck).filter(
                        (item)=>{
                            return ((folderItemType(item[1]) == "FOLDER") && (item[0].substring(0, incompleteChild?.length) == incompleteChild) )
                        }
                    )
                )
            }
            //If parent doesnt exist, show no suggestions 
            else {
                setCurrentPathSuggestions([])
            }
        }
            
    }


    return(
    <div className="file-explorer">
        <div className="menu-bar"> 
            <div className="back-button" onClick={()=>{backButtonPressed()}}>
                <img src="https://www.svgrepo.com/show/500777/back.svg" />
            </div>
            <input type="text" onFocus={()=>{setShowPathSuggestions(true); RenderPathSuggestions()}} onBlur={()=>{setShowPathSuggestions(false);RenderPathSuggestions()}}  autoComplete="off" value={addressBoxPath} onKeyDown={(event)=>{onAddressSubmit(event)}} onChange={(event)=>{setAddressBoxPath(event.target.value); RenderPathSuggestions(event.target.value)}} name="address-box" id="" />
            {showPathSuggestions ? <div className="path-suggestion">
                {"" + currentPathSuggestions}
            </div> : <></>}
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