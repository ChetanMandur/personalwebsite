import { useEffect, useState } from "react"
import "./FileExplorer.css"
import { MyFileSystem, MyFileSystemFile, MyFileSystemFolder } from "./MyFileSystem"

export type FileExplorerProps = {
    path: string
}

export default function FileExplorer({path}:FileExplorerProps){
    const [currentPath, setCurrentPath] = useState("")
    const [addressBoxPath, setAddressBoxPath] = useState("")
    const [currentFolder, setCurrentFolder] = useState<[string, MyFileSystemFolder | MyFileSystemFile][]>([])

    useEffect(()=>{
        if (path !=undefined){
            let pathCleaned:string = pathClean(path)

            const pathExists:(MyFileSystemFolder|null) =  doesPathExist(pathCleaned)
            if (pathExists != null){
                setCurrentPath(pathCleaned)
                setAddressBoxPath(pathCleaned)
                setCurrentFolder(Object.entries(pathExists))
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



    function doesPathExist(path: string):(MyFileSystemFolder|null){
         const folderList: string[]= pathToArray(path)
        //  console.log("FOLDERLIST ", folderList.length, folderList)

         let exists:boolean = true
         let currentFolder: MyFileSystemFolder = MyFileSystem

         for (const i of folderList){
            try {
                currentFolder = currentFolder[i] as MyFileSystemFolder

            } catch (error) {
                exists = false;
                return null
            }
         }
         return currentFolder
    }

    function onAddressSubmit(event: React.KeyboardEvent<HTMLInputElement>){
        if(event.key == "Enter"){
            let pathCleaned:string = pathClean(addressBoxPath)

            const pathExists:(MyFileSystemFolder|null) =  doesPathExist(pathCleaned)

            if (pathExists == null){
                alert(`The path ${pathCleaned} does not exist.` )
                setAddressBoxPath(currentPath)
            } else{
                setCurrentPath(pathCleaned)
                setAddressBoxPath(pathCleaned)
                setCurrentFolder(Object.entries(pathExists))
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
        }

    }

    function folderPressed(folderName:string){
        let pathArray = pathToArray(currentPath)
        pathArray.push(folderName)
        let newPath = arrayToPath(pathArray)

        setAddressBoxPath(newPath)
        setCurrentPath(newPath)
        setCurrentFolder(Object.entries(doesPathExist(newPath)!))

    }


    function itemClickedHandler(item: [string, MyFileSystemFolder | MyFileSystemFile]){
        if (item[1].type == undefined){
            folderPressed(item[0])
        }
    }
    


    return(
    <div className="file-explorer">
        <div className="menu-bar"> 
            <div className="back-button" onClick={()=>{backButtonPressed()}}>
                <img src="https://www.svgrepo.com/show/500777/back.svg" />
            </div>
            <input type="text" value={addressBoxPath} onKeyDown={(event)=>{onAddressSubmit(event)}} onChange={(event)=>{setAddressBoxPath(event.target.value)}} name="address-box" id="" />
        </div>
        <div className="content">
        {
           currentFolder.map ( (item) =>{
            
            return(
                <div className="item" key={item[0]} onClick={()=>(itemClickedHandler(item))}>
                    <div className="icon">{item[1].type != undefined ? <img src="https://www.svgrepo.com/show/535388/file.svg"/> : <img src="https://www.svgrepo.com/show/535397/folder-open.svg"/>}</div>
                    <div className="name">{item[1].type != undefined ? (item[1].name as string) : (item[0])}</div>
                </div>
            )
           })
        }
        </div>
    </div>
    )
}