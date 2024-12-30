import { useContext, useEffect, useState } from "react"
import "./FileExplorer.css"
import { MyFileSystem, MyFileSystemFile, MyFileSystemFolder } from "./MyFileSystem"
import { ContextMenuContext, ContextMenuOptions, contextMenuPropagation } from "../../Desktop/Contexts/ContextMenuData"
import { RunningAppsContext } from "../../Desktop/Contexts/RunningApps"
import { AppList } from "../Apps"
import { MediaViewerProps } from "../MediaViewer/MediaViewer"

export type FileExplorerProps = {
    path: string
}

export default function FileExplorer({path}:FileExplorerProps){
    const [currentPath, setCurrentPath] = useState<string>("")
    const [addressBoxPath, setAddressBoxPath] = useState<string>("")
    const [currentFolder, setCurrentFolder] = useState<[string, MyFileSystemFolder | MyFileSystemFile | boolean][]>([])
    const [selected, setSelected] = useState<string>("")
    const [showHidden, setShowHidden] = useState<boolean>(false)

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


    //When output is [], that means we are on root
    //Each element is a path starting from root, ie.  = /[0]/[1]/[2]
    function pathToArray(path:string):string[]{
        let array:string[] = []
        let splitPath = path.split("/")

        for (const i of splitPath){
            if (i != ""){
                array.push(i)
            }
        }

        // console.log("pathToArray", array)
        return array

    }

    function arrayToPath(array:string[]):string{
        let path = ""

        for (const i of array){
            path += "/" + i
        }

        if (path == ""){
            path = "/"
        }

        // console.log("arrayToPath", path)
        
        return path
    }


    function pathClean(path:string):string{

        return arrayToPath(pathToArray(path))

    }

    function folderItemType(item: MyFileSystemFolder | MyFileSystemFile | boolean, ):"FOLDER"|"FILE"|"BOOLEAN"{
        if (typeof(item) == "boolean"){
            return "BOOLEAN"
        }
        if (item.type == undefined){
            return "FOLDER"
        } else{
            return "FILE"
        }
    }


    function doesPathExist(path: string):(MyFileSystemFolder|null|"FILE"){
         const folderList: string[]= pathToArray(path)
        //  console.log("FOLDERLIST ", folderList.length, folderList)

         let currentFolder: MyFileSystemFolder = MyFileSystem

         for (const i of folderList){
            try {
                switch (folderItemType(currentFolder[i])) {
                    case "BOOLEAN":
                        return null
                    
                    case "FILE":
                        return "FILE"

                    case "FOLDER":
                        currentFolder = currentFolder[i] as MyFileSystemFolder;
                }

            } catch (error) {
                return null
            }
         }
         return currentFolder
    }

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

    function folderPressed(folderName:string){
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
                folderPressed(item[0])
                break;

            }
            case "FILE":{
                //launch respective viewer for media file
                // switch (item[1].type) {
                //     case "IMAGE":
                        
                //         break;
                //     case "PDF":
                //         break;

                //     case "VIDEO":
                //         break;
                        
                //     default:
                //         break;
                // }
                runningAppsDispatch({type:"ADD", app_name:"MediaViewer", app_properties: AppList["MediaViewer"], props:{data:(item[1] as MyFileSystemFile).data, type:(item[1] as MyFileSystemFile).type} as MediaViewerProps})
                setSelected("")
                break;
            }
            default:{
                break;
            }

        }
        
    }


    function fileThumbnailGetter(fileType: MyFileSystemFile["type"]):string{

        switch (fileType){
            case "IMAGE":
                return "https://www.svgrepo.com/show/141793/image-file.svg"
            case "VIDEO":
                return "https://www.svgrepo.com/show/357253/video-file.svg"
            case "PDF":
                return "https://www.svgrepo.com/show/64173/pdf-file.svg"
            default:
                return "https://www.svgrepo.com/show/535388/file.svg"
        }
    }


    let toggleHiddenFilesContextMenu = {} as ContextMenuOptions

    if (!showHidden){
        toggleHiddenFilesContextMenu["Show hidden files"] = ()=>{setShowHidden(true)}
    } else{
        toggleHiddenFilesContextMenu["Hide hidden files"] = ()=>{setShowHidden(false)}

    }


    return(
    <div className="file-explorer">
        <div className="menu-bar"> 
            <div className="back-button" onClick={()=>{backButtonPressed()}}>
                <img src="https://www.svgrepo.com/show/500777/back.svg" />
            </div>
            <input type="text" autoComplete="off" value={addressBoxPath} onKeyDown={(event)=>{onAddressSubmit(event)}} onChange={(event)=>{setAddressBoxPath(event.target.value)}} name="address-box" id="" />
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