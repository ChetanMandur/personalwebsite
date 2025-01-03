import { MyFileSystem, MyFileSystemFile, MyFileSystemFolder } from "./MyFileSystem"

//When output is [], that means we are on root
//Each element is a path starting from root, ie.  = /[0]/[1]/[2]
export function pathToArray(path:string):string[]{
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

export function arrayToPath(array:string[]):string{
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

export function pathClean(path:string):string{

    return arrayToPath(pathToArray(path))

}

export function getParentPath(path:string):string{
    path = pathClean(path)
    let pathArray = pathToArray(path)
    pathArray.pop()

    return arrayToPath(pathArray)
}


export function folderItemType(item: MyFileSystemFolder | MyFileSystemFile | boolean, ):"FOLDER"|"FILE"|"BOOLEAN"{
    if (typeof(item) == "boolean"){
        return "BOOLEAN"
    }
    if (item.type == undefined){
        return "FOLDER"
    } else{
        return "FILE"
    }
}

export function doesPathExist(path: string):([MyFileSystemFolder|null|MyFileSystemFile, "FOLDER"|"FILE"|"BOOLEAN"|"ERROR"]){
    const folderList: string[]= pathToArray(path)
   //  console.log("FOLDERLIST ", folderList.length, folderList)

    let currentFolder: MyFileSystemFolder = MyFileSystem
    let counter = 1
    for (const i of folderList){
       try {
           switch (folderItemType(currentFolder[i])) {
               case "BOOLEAN":
                   return [null, "BOOLEAN"]
               
               case "FILE":
                    if (counter == folderList.length){
                        return [currentFolder[i] as MyFileSystemFile, "FILE"]
                    }
                   return [null, "ERROR"]

               case "FOLDER":
                   currentFolder = currentFolder[i] as MyFileSystemFolder;
           }

       } catch (error) {
            return [null, "ERROR"]
       }
       counter++
    }
    return [currentFolder, "FOLDER"]
}

export function fileThumbnailGetter(fileType: MyFileSystemFile["type"]):string{

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