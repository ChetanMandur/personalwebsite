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
    const [currentPathSuggestions, setCurrentPathSuggestions] = useState<string[]|undefined>([])

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

        //Clean path and find pathArray
        path = pathClean(path)
        let pathArray = pathToArray(path)


        //Check current path, see if it exists
        const pathCheck = doesPathExist(path)

        //If it does exist (a complete path) then find all folders within path and display
        if (pathCheck != null && pathCheck != "FILE"){

            //Filter content to find folders
            let foldersInPath = Object.entries(pathCheck).filter(
                (item)=>{
                    if ((item[1] as MyFileSystemFile|MyFileSystemFolder).hidden && !showHidden){
                        return false
                    }
                    return ((folderItemType(item[1]) == "FOLDER"))
                }
            )

            //Construct new path suggestions based on filtered content
            let newPathSuggestions:string[] = []
            for (const i of foldersInPath){
                if (pathArray.length == 0){
                    //If pathArray is 0, that means path = "/"
                    newPathSuggestions.push(path + i[0])
                } else{
                    newPathSuggestions.push(path + "/" + i[0])

                }
            }
            setCurrentPathSuggestions(newPathSuggestions)

        }

        //If it doesnt exist (either incomplete name/doesnt exist)
        else{
            // Find child
            let incompleteChild = pathArray.pop() //incompleteChild = last item in pathArray

            // Find parent path
            let parentPath = arrayToPath(pathArray) //parentPath = pathArray - last item

            //Check to see if parent exists
            const parentCheck = doesPathExist(parentPath)

            //If parent exists, show folders that are close to the incomplete child
            if (parentCheck != null && parentCheck != "FILE"){
                let foldersInPath = Object.entries(parentCheck).filter(
                    (item)=>{
                        if ((item[1] as MyFileSystemFile|MyFileSystemFolder).hidden && !showHidden){
                            return false
                        }
                        return ((folderItemType(item[1]) == "FOLDER") && (item[0].substring(0, incompleteChild?.length) == incompleteChild) )
                    }
                )

                //Construct new path suggestions based on filtered content
                let newPathSuggestions:string[] = []
                for (const i of foldersInPath){
                    if (pathArray.length == 0){
                        //If pathArray is 0, that means path = "/"
                        newPathSuggestions.push(parentPath + i[0])
                    } else{
                        newPathSuggestions.push(parentPath + "/" + i[0])
                    }
                }
                if (newPathSuggestions.length == 0){
                    setCurrentPathSuggestions(undefined)
                }else{
                    setCurrentPathSuggestions(newPathSuggestions)

                }

            }
            //If parent doesnt exist, show no suggestions (not sure if this is really needed tbh, and i dont wanna test rn)
            else {
                setCurrentPathSuggestions(undefined)
            }
        }

    }


    return(
    <div className="file-explorer">
        <div className="menu-bar"> 
            <div className="back-button" onClick={()=>{backButtonPressed()}}>
                <img src="https://www.svgrepo.com/show/500777/back.svg" />
            </div>
            <input type="text" onFocus={()=>{setShowPathSuggestions(true); RenderPathSuggestions()}} onBlur={()=>{setShowPathSuggestions(false);RenderPathSuggestions()}} spellCheck="false"  autoComplete="off" value={addressBoxPath} onKeyDown={(event)=>{onAddressSubmit(event)}} onChange={(event)=>{setAddressBoxPath(event.target.value); RenderPathSuggestions(event.target.value)}} name="address-box" id="" />
            {showPathSuggestions ? 
                <div className="path-suggestion">
                    {
                        currentPathSuggestions != undefined ? 
                            (
                                currentPathSuggestions.length != 0 ? 
                                (
                                    currentPathSuggestions.map( (item)=>{
                                        return (
                                            <div key={item} className="path-suggestion-item">{item}</div>
                                        )
                                    })
                                ) 
                                : 
                                (
                                    <div key={"noFoldersInPath"} className="path-suggestion-message">No folders within path</div>
                                )
                            ) 
                            : 
                            (<div key={"folderDoesNotExist"} className="path-suggestion-message">Invalid path</div>)
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