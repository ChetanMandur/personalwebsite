import { MyFileSystem, MyFileSystemFile, MyFileSystemFolder } from "./MyFileSystem"

/**
 * Given a path in `string` format, returns an `array` representing the equivalent path
 * 
 * Each folder in the `string` path is an element in the final `array` (ie. /[0]/[1]/[2])
 * 
 * @example "/Photos/folder" => ["Photos", "folder"]
 * @param path - The path (as a `string`) that will be converted to an `array`
 * 
 * @returns A `string array`, with each element representing a folder, in order of traversal
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
 * Given a path in `string array` format, return an equivalent path in `string` format
 * 
 * Intended to work with array paths generated with the `pathToArray()`
 * @example ["Photos", "folder"] => "Photos/folder"
 * @param array The path (as a `string array`) that will be converted back to a `string`
 * - The path array must be 'clean' (ie. the path must not have any empty `string` elements)
 * @returns A path in `string` format
 * - Empty `arrays` will return `'/'` representing rooot
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

/**
 * Given a path in `string` format, return an equivalent path in `string` format that is cleaned
 * 
 * A 'clean' path is a path that has been reduced 
 * 
 * This function just calls `pathToArray(path)` into `arrayToPath()`
 * - `pathToArray()` handles excess `'/'` values, removing empty paths
 * - `arrayToPath()` converts the reduced `array` path back to a `string`
 * 
 * @example "///Photos//folder" => "/Photos/folder"
 * 
 * @param path The path (as a `string`) that will be cleaned
 * @returns A `string` path that is cleaned
 */

export function pathClean(path:string):string{

    return arrayToPath(pathToArray(path))

}

/**
 * Given a path (in `string` format), return the direct parent 
 * @example '/Photos/folder' ==> '/Photos/' 
 * @param path - The child path (as a `string`) whos parent will be returned 
 * @returns - A `string` path representing the parent 
 */

export function getParentPath(path:string):string{
    // Quick way to get parent path, convert path to an array, remove last element, and convert array back to string

    const pathArray = pathToArray(path)
    pathArray.pop()
    return arrayToPath(pathArray)
}


/**
 * Given an item within a `MyFileSystemFolder` object, returns the type of item it is
 * @param item - An item within `MyFileSystemFolder` (ie. `boolean`, `MyFileSystemFolder`, or `MyFileSystemFile` )
 * @returns A string representation of the item's type (ie. `"FOLDER"`, `"FILE"`, or `"BOOLEAN"`)
 */
export function folderItemType(item: MyFileSystemFolder[""], ):"FOLDER"|"FILE"|"BOOLEAN"{
    // Checks if the item is of primitive JavaScript data type 'boolean'  
    if (typeof(item) == "boolean"){
        return "BOOLEAN"
    }
    // Only MyFileSystemFile has a 'type' property
    if (item.type == undefined){
        return "FOLDER"
    } 
    else{
        return "FILE"
    }
}


/**
 * When given a path, in `string` format, returns whether or not path exists within `MyFileSystem`
 * 
 * Check is done by walking the given path from root and returning its content
 * @param path - The path (as a `string`) that is to be checked
 * @returns  Content of the path + an identifier. Possible values are:
 * - `[MyFileSystemFolder, "FOLDER"]`: If path leads to a folder, return folder content + identifier
 * - `[MyFileSystemFile, "FILE"]`: If path leads to a file, return file content + identifier
 * - `[null, "BOOLEAN"|"ERROR"]`: If path leads to neither a file or folder, return null + identifier
 */
export function doesPathExist(path: string):([MyFileSystemFolder, "FOLDER"]|[MyFileSystemFile, "FILE"]|[null, "BOOLEAN"|"ERROR"]){

    // Convert string path to an array, allows us to walk the path from root
    const folderList: string[]= pathToArray(path)

    // Start at root, with counter starting at 1 (counter does not follow index numbering)
    let currentFolder: MyFileSystemFolder = MyFileSystem
    let counter = 1

    // For each of the items in folderList
    for (const currentItem of folderList){
       try {
            // Find the item's type
           switch (folderItemType(currentFolder[currentItem])) {

                // If item is a boolean, this means that path doesn't exist. Return null + identifier
                case "BOOLEAN":
                    return [null, "BOOLEAN"]
                
                // If item is a file
                case "FILE":
                    // And the item is the last item in the path (ie. `/item1/item2/file`)
                    if (counter == folderList.length){
                        // Return the file + identifier (as it is a valid path)
                        return [currentFolder[currentItem] as MyFileSystemFile, "FILE"]
                    }

                    // If item is not the last item in the path, path doesn't exist. Return null + identifier
                    // This is because, if item is not last item, that means full path is trying to enter the file as if it is a folder
                    // ie. `/item1/item2/file/item3/item4` is invalid as file cannot be entered as a folder
                    return [null, "ERROR"]
                
                // If item is a folder
                case "FOLDER":
                    // Set item as new current folder
                    currentFolder = currentFolder[currentItem] as MyFileSystemFolder;
            }

       } 
       
       // If the switch statement errors, path is invalid. Return null + identifer
       catch {
            return [null, "ERROR"]
       }

       // If reached, it means that item was a folder
       // Increase counter and continue loop
       counter++
    }

    // If reached, it means that path was valid and led to a folder
    // Return folder + identifer
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