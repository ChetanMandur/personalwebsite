import { MyFileSystem, MyFileSystemFile, MyFileSystemFolder } from "./MyFileSystem"

/**
 * Given a path in string format, returns an array representing the equivalent path
 * 
 * Each element is a path starting from root, ie. /[0]/[1]/[2]
 * 
 * @param path - The path (as a `string`) that will be converted to an array
 * 
 * @returns An array of `string` values, with each element representing a folder, in order of traversal
 * - When output is `[]` (empty), that means the given path represents root
 * 
 */
export function pathToArray(path:string):string[]{
    // Initalizing output array & splitting input string by '/' (path seperators)
    const array:string[] = []
    const splitPath = path.split("/")

    // Builds output array, ignoring any empty spaces (ie. "//" = ['','',''])
    for (const i of splitPath){
        if (i != ""){
            array.push(i)
        }
    }
    return array

}

/**
 * Given a path in array format (with each element being a `string` value), return an equivalent path in `string` format
 * 
 * Intended to work with array paths generated with the `pathToArray()`
 * @param array The path (as an array of `string` values) that will be converted back to a `string`
 * - The path array must be 'clean' (ie. the path must not have any empty string elements)
 * @returns A path in `string` format
 * - Empty arrays will return `'/'` representing rooot
 */
export function arrayToPath(array:string[]):string{
        // An empty array represents root
        if (array.length == 0){
            return "/"
        }

        // If array isn't empty, build path string
        let path = ""

        for (const i of array){
            path += "/" + i
        }
        
        return path
}

export function pathClean(path:string):string{

    return arrayToPath(pathToArray(path))

}

export function getParentPath(path:string):string{
    path = pathClean(path)
    const pathArray = pathToArray(path)
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

       } catch {
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