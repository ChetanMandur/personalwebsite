import { createRef, useContext, useEffect, useState } from "react"
import "./FileExplorer.css"
import { MyFileSystem, MyFileSystemFile, MyFileSystemFolder } from "./MyFileSystem"
import { ContextMenuContext, ContextMenuOptions, contextMenuPropagation } from "../../Desktop/Contexts/ContextMenuContext"
import { AppRunningID, RunningAppsContext } from "../../Desktop/Contexts/RunningAppsContext"
import { MediaViewerProps } from "../MediaViewer/MediaViewer"
import { pathClean, doesPathExist, pathToArray, arrayToPath, folderItemType, fileThumbnailGetter, getParentPath, getChildItemName } from "./FileExplorerHelpers"
import { TooltipContext } from "../../Desktop/Contexts/TooltipContext"

export type FileExplorerProps = AppRunningID & {
    path: string
}

//A FolderEntry represents an item in a folder
//A FolderEntry has info for it's name & the data for the entry
// The data for an entry can either be another folder, or an item
// boolean is a possible FolderEntry, as the boolean represents an folder's 'hidden' property
type FolderEntry = [string, MyFileSystemFolder | MyFileSystemFile | boolean]


//Typing used for the currentFolder useState
//Holds information for the current path/address displayed within FileExplorer
// The information contains the string path/address/location of the folder along with the items within the folder
type CurrentFolder = {
    path: string,
    content: FolderEntry[]
}

//Typing used for the pathSuggestion useState
//Holds information/data on what to display in the 'suggestions' panel that appears when using the address bar
// The information contains:
    // a ref to reference the input field/address box
    // a boolean to determine whether or not to display the panel
    // a number to determine which item is being highlighted (if any)
    // a variable to represent the content/suggestions based on path given in addressBox
        // Typing is slightly different than FolderEntry, as it doesn't hold the content for each item in the path, rather the paths of each item + the item type
        // If path doesnt lead to a folder, can also explain what is at the path (via a string)
type PathSuggestion = {
    ref:React.MutableRefObject<null | HTMLInputElement>,
    display: boolean,
    highlight: number,
    content: [string, "FILE"|"FOLDER"][]| //For when path leads to a folder w/ items, an array of 
            "EMPTY"| //For when path leads to a folder w/o items
            "FILE"| //For when path leads to a file
            "ERROR" //For when the path leads to no where, the unknown, or to nothingness.... the path given is such of one that does not exist: a fools journey. Only those fearless or unwise would dare to even attempt to wander
}

export default function FileExplorer({path, app_running_id}:FileExplorerProps){
    const [addressBox, setAddressBox] = useState<string>("/") //Address box text
    const [currentFolder, setCurrentFolder] = useState<CurrentFolder>({path:"/", content:Object.entries(MyFileSystem)}) //Current folder information

    const [selected, setSelected] = useState<string>("") //Holds name of selected item 
    const [showHidden, setShowHidden] = useState<boolean>(false) //Property to determine if hidden files/folders are to be shown

    const [pathSuggestion, setPathSuggestion] = useState<PathSuggestion>(
        {ref:createRef<HTMLInputElement>(),display:false, highlight: -1, content: []}
    ) //Path suggestions information


    //Contexts that are used 
    const {contextMenuDispatch} = useContext(ContextMenuContext)
    const {runningAppsDispatch} = useContext(RunningAppsContext)
    const {tooltipDispatch} = useContext(TooltipContext)
    

    //Used for when component is mounted
    //  A starting path can be given through component props
    //  Essentially the same as pathEnter, except how it handles errors
    //  pathEnter gives an error message before resetting addressBox back to current folder path (as current folder path would be the last valid path)
    //  This useEffect doesn't give an error message, instead it just sets the current path as root
    useEffect(()=>{
        // If a path is given
        if (path !=undefined){ 
            pathEnter(path, true)
        } 

    },[])

    // Used for 'blur-ing' the address text field when the path suggestion is closed
    //  If path suggestion is closed, the address field shouldn't be focused at all
    useEffect(()=>{
        if (!pathSuggestion.display){
            pathSuggestion.ref.current?.blur()
        }
    }, [pathSuggestion.display])

    /**
     * Given a path (as a string), try and enter the folder
     * @param path - The path that is attempted to be entered
     * @param suppressError - (Optional) Surpresses any error message when an invalid path is given. When not given, error message will not be surpressed
     */
    function pathEnter(path:string, suppressError?:boolean){
        path = pathClean(path)
        const [pathObject, pathResponse] =  doesPathExist(path)

        if (pathObject == null){
            if (suppressError == undefined || suppressError == false){
                alert(`The path ${path} does not exist.` )
            } 
            setAddressBox(currentFolder.path)
        } 
        else{
            // If path leads to a file, open the file in MediaViewer and pathEnter the parentPath
            if (pathResponse == "FILE"){ 
                runningAppsDispatch({type:"ADD", app_name:"MediaViewer",  props:{fileContent:(pathObject as MyFileSystemFile), fileName:getChildItemName(path)} as MediaViewerProps})
                pathEnter(getParentPath(path))
                setPathSuggestion(pendingState=>({...pendingState, display: false}))
            } 
            else if (pathResponse == "FOLDER"){ 
                setAddressBox(path)
                setCurrentFolder({path: path, content: Object.entries(pathObject)})
                runningAppsDispatch({type:"UPDATE-APP-ADDITIONAL-TITLE", app_running_id:app_running_id,appAdditionalTitle: getChildItemName(path)})

                RenderPathSuggestions(path)
                setSelected("")
            }
        }
    }
         
    /**
     * Keyhandler for the addressBox
     * @param event - Keyboard event from onKeyDown
     */
    function addressKeyHandler(event: React.KeyboardEvent<HTMLInputElement>){
        switch (event.key) {
            case "Enter":
                pathEnter(addressBox)
                event.currentTarget.blur()
                break;

            case "ArrowUp":
                event.preventDefault()
                // If pathSuggestion isn't a string, that means there are multiple items to parse thru
                if (typeof pathSuggestion.content != "string"){ 
                    // For when an item is highlighted (not including the address bar)
                    if (-1 < pathSuggestion.highlight && pathSuggestion.highlight <= pathSuggestion.content.length-1){ 
                        // Move highlight up one
                        const newHighlight = pathSuggestion.highlight - 1 
                        setPathSuggestion(pendingState =>({...pendingState, highlight: newHighlight}))

                        // If highlight is now -1, that means that the user is now highlighting the address bar
                        if (newHighlight == -1){ 
                            setAddressBox(currentFolder.path)
                        } 

                        // Else, means that the user is highlighting an item above the previous item
                        else{ 
                            setAddressBox(pathSuggestion.content[newHighlight][0])
                        }
                    } 

                    // For when the address bar is highlighted
                    else if (pathSuggestion.highlight == -1){ 
                        // Going up means jumping to the bottom of the suggestions list
                        setPathSuggestion(pendingState => ({...pendingState, highlight: pendingState.content.length - 1})) 
                        setAddressBox(pathSuggestion.content[pathSuggestion.content.length-1][0])
    
                    }
                } 
                // If pathSuggestion is a string, that means there is only 1 item (the message), so highlighting the item is essentially true or false
                else{ 
                    setPathSuggestion(pendingState => ({...pendingState, highlight: ((pendingState.highlight != -1) ? (-1) : (0))}))
                }
                break;

            case "ArrowDown":
                event.preventDefault()
                //If pathSuggestion isn't a string, that means there are multiple items to parse thru
                if (typeof pathSuggestion.content != "string"){ 
                    //For when an item (not including the last item) or the address bar is highlighted 
                    if (-1 <= pathSuggestion.highlight && pathSuggestion.highlight < pathSuggestion.content.length-1){ 
                        const newHighlight = pathSuggestion.highlight +1
                        setPathSuggestion(pendingState => ({...pendingState, highlight: newHighlight}))
                        setAddressBox(pathSuggestion.content[newHighlight][0])
                    } 
                    //For when the last item is highlighted 
                    else if (pathSuggestion.highlight == pathSuggestion.content.length-1){ 
                        // Loop back to addressBar
                        setPathSuggestion(pendingState => ({...pendingState, highlight: -1}))
                        setAddressBox(currentFolder.path)
                    }
                }
                // If pathSuggestion is a string, that means there is only 1 item (the message), so highlighting the item is essentially true or false
                else{ 
                    setPathSuggestion(pendingState => ({...pendingState, highlight: ((pendingState.highlight != -1) ? (-1) : (0))}))
                }
                break;
            
            case "ArrowRight":
                    // Only applies when addressBar isn't highlighted/focused
                    if (pathSuggestion.highlight != -1){ 
                        //When pathSuggestion has content (isn't a message)
                        if (typeof pathSuggestion.content != "string"){ 
                            //Prevent arrow key from moving addressBar cursor to the right right
                            event.preventDefault() 
                            //Enter the item
                            pathEnter(pathSuggestion.content[pathSuggestion.highlight][0]) 
                            //If item is a file
                            if (pathSuggestion.content[pathSuggestion.highlight][1] == "FILE"){ 
                                //We need to unfocus (ie blur) the addressBox input box (as file will open in new window which should have focus)
                                event.currentTarget.blur() 
                            } 
                            //If item is a folder
                            else{ 
                                //Move highlight back to top of the list
                                setPathSuggestion(pendingState => ({...pendingState, highlight: 0})) 
                            }
                        } 
                        //When path suggestion is a message (doesn't have content)
                        else { 
                            //If message is an error, reset to current folder
                            if (pathSuggestion.content == "ERROR"){
                                setAddressBox(currentFolder.path)
                            }
                            //If message for a valid path, enter path (whether it is a file/empty folder)
                            else{
                                pathEnter(addressBox)
                            }
                            // Will always need to unfocus from addressBox input
                            event.currentTarget.blur()

                        }
                    }
                
                break;

            case "ArrowLeft":
                //Only applies when addressBar isn't highlighted/focused
                if (pathSuggestion.highlight != -1){ 
                    //Prevent arrow key from moving addressBar cursor to the left
                    event.preventDefault() 
                    // Go back a folder
                    pathEnter(getParentPath(currentFolder.path)) 
                    // Move highlight back to top of the list
                    setPathSuggestion(pendingState =>({...pendingState, highlight: 0})) 
                }
                break;
            
            //When any other key is pressed, we want the key to appear in the addressBar
            default: 
                //If addressBar isnt highlighted, make it highlighted
                if (pathSuggestion.highlight != -1){ 
                    setPathSuggestion(pendingState => ({...pendingState, highlight: -1}))
                }
                break;
        }
    }


    /**
     * Handler for when the back button is pressed
     * 
     * Has no parameters, relies on `currentFolder.path`
     * 
     * If `currentFolder` is root, back button has no effect
     */
    function backButtonPressed(){
        const pathArray = pathToArray(currentFolder.path)
        if (pathArray.length != 0){ //If length == 0, that means we are on root, which means we can't go back any further
            pathArray.pop()
            const newPath = arrayToPath(pathArray)

            pathEnter(newPath)
        }
    }


    /**
     * Handler for when an item is single clicked
     * 
     * Stores item's name in `selected` useState
     * @param item - The item (of type `FolderEntry`)
     * @param event - The mouse event from the onClick handler
     */
    function itemClickedHandler(item: FolderEntry, event: React.MouseEvent<HTMLDivElement, MouseEvent>){
        event.stopPropagation();
        if (selected != item[0]){
            setSelected(item[0])
        }
    }

    /**
     * Handler for when an item is double clicked
     * @param item - The item that was double clicked
     * @param event - The mouse event from the onDoubleClick handler
     */
    function itemDoubleClickedHandler(item: FolderEntry, event: React.MouseEvent<HTMLDivElement, MouseEvent>){
        event.stopPropagation();
        pathEnter(currentFolder.path + "/" +item[0])
        setSelected("")
    }

    
    /**
     * Function for generating the suggestions/items used in the path suggestions panel
     * @param path - Optional parameter, if not given then `addressBox` state variable is used
     */
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

        //If path exists, this means that path is valid (ie a complete path) and leads to content
        if (pathObject != null){
            // If path leads to a folder
            if (pathResponse == "FOLDER"){ 
                // Filter content to find only Files and Folders (while adhering to current showHidden state)
                const filesInPath = Object.entries(pathObject).filter(
                    (item)=>{
                        // Checks if file/folder is hidden and if we are showing hidden files/folders
                        // If item is hidden and we aren't displaying hidden items, exclude item
                        if ((item[1] as MyFileSystemFile|MyFileSystemFolder).hidden && !showHidden){
                            return false
                        }
                        const itemType = folderItemType(item[1])
                        // Don't want to include boolean items (ie the hidden parameter)
                        return (( itemType == "FOLDER" || itemType=="FILE" ))
                    }
                )

                // If after filtering the length is above 0, this means that there is content in the folder
                if (filesInPath.length != 0){
                    // Construct new path suggestions based on filtered content
                    const newPathSuggestionContent:PathSuggestion["content"] = []
                    for (const i of filesInPath){
                        const itemType = folderItemType(i[1])
                        // Although we know itemType will never be "BOOLEAN" (due to the filter), typescript doesn't and it doesn't hurt
                        if (itemType != "BOOLEAN"){
                            // If pathArray is 0, that means path = "/", therefore the "/" is not needed
                            newPathSuggestionContent.push([path + (pathArray.length == 0 ? "" : "/") + i[0], itemType])

                        }
                    }
                    setPathSuggestion(pendingState => ({...pendingState, content: newPathSuggestionContent}))
                } 
                
                // If after filtering the length is 0, this means that there is no content in the folder, so set content as "EMPTY"
                else{
                    setPathSuggestion(pendingState => ({...pendingState, content: "EMPTY"}))
                }
            }
            // If path leads to a file, set content as "FILE"
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

            // Check to see if parent exists
            const [parentObject, parentResponse] = doesPathExist(parentPath)

            // If parent exists, show folders that are close to the incomplete child
            if (parentObject != null && parentResponse == "FOLDER"){

                // Filter content to find only Files and Folders that could be the incompleteChild (while adhering to current showHidden state)
                const filesInPath = Object.entries(parentObject).filter(
                    (item)=>{
                        // Checks if file/folder is hidden and if we are showing hidden files/folders
                        // If item is hidden and we aren't displaying hidden items, exclude item
                        if ((item[1] as MyFileSystemFile|MyFileSystemFolder).hidden && !showHidden){
                            return false
                        }
                        const itemType = folderItemType(item[1])
                        // Don't want to include boolean items (ie the hidden parameter)
                        // Want to include items that could be the incompleteChild (items that are starting the same as the incompleteChild)
                        //  example, if the incompleteChild == "Wiki", then display all items that start with "Wiki"
                        return ((itemType == "FOLDER" || itemType == "FILE") && (item[0].substring(0, incompleteChild?.length) == incompleteChild) )
                    }
                )

                // If after filtering the length is above 0, this means that there are items similar to the incomplete child
                if (filesInPath.length != 0){
                    // Construct new path suggestions based on filtered content
                    const newPathSuggestionContent:PathSuggestion["content"] = []
                    for (const i of filesInPath){
                        const itemType = folderItemType(i[1])
                            // Although we know itemType will never be "BOOLEAN" (due to the filter), typescript doesn't and it doesn't hurt
                            if (itemType != "BOOLEAN"){
                                // If pathArray is 0, that means path = "/", therefore the "/" is not needed
                                newPathSuggestionContent.push([parentPath + (pathArray.length == 0 ? "" : "/") + i[0], itemType])
                            }
                    }
                    setPathSuggestion(pendingState => ({...pendingState, content: newPathSuggestionContent}))
                }

                // If the length is 0, that means that there aren't items similar to the incomplete child
                else{
                    setPathSuggestion(pendingState => ({...pendingState, content:"ERROR"}))
                }

            }

            // If parent doesnt exist, show no suggestions (not sure if this is really needed tbh, and i dont wanna test rn)
            else {
                setPathSuggestion(pendingState => ({...pendingState, content:"ERROR"}))
            }
        }

    }

    const toggleHiddenFilesContextMenu = {} as ContextMenuOptions
    if (!showHidden){
        toggleHiddenFilesContextMenu["Show hidden files"] = ()=>{setShowHidden(true)}
    } else{
        toggleHiddenFilesContextMenu["Hide hidden files"] = ()=>{setShowHidden(false)}

    }

    return(
    <div className="file-explorer">

        {/* MenuBar
        Contains back-button + address-box on single line
        */}
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
                name="address-box" 
                ref={pathSuggestion.ref} 
            />
        </div>
        
        
        {/* Inline conditional for whether or not to display path suggestions */}
        {pathSuggestion.display ? 
            // Main Container for Path Suggestion
            <div className="path-suggestion">
                {
                    typeof pathSuggestion.content == "string" ?
                    (
                        // If pathSuggestion.content is a string, display a path-suggestion-message
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
                        //If pathSuggestion.content has items, map each item into a path-suggestion-item
                        pathSuggestion.content.map( (item, index)=>{
                            return (
                                <div key={item[0]+"pathSuggestionItem"} 
                                    className={"path-suggestion-item " + (pathSuggestion.highlight==index ? "path-suggestion-item-active": "")} 
                                    onMouseDown={(event)=>{
                                        event.preventDefault();
                                        pathEnter(item[0]);
                                        setPathSuggestion(pendingState =>({...pendingState, display: false}))
                                    }} 
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

        {/* Main container for folder content
            This is where the UI displaying each item of the folder is made
        */}
        <div className="folder-content" 
            onClick={()=>{setSelected("")}} 
            onContextMenu={(event)=>{
                contextMenuPropagation(event); 
                setSelected("");
                contextMenuDispatch({type:"SET",event:event, options:toggleHiddenFilesContextMenu});
            }}
        >
            {
                // For each item in the current folder, map it into a item class
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
                                        options:{
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
                            onClick={(event)=>{itemClickedHandler(item, event);}} 
                            onDoubleClick={(event)=>{itemDoubleClickedHandler(item,event)}}
                            onMouseMove={(event)=>{tooltipDispatch({type:"SET", event: event, data:item[0], dataType:"TEXT"})}}
                            draggable= {itemType == "FILE" ? "true" : "false"}
                            onDragStart={(event)=>{
                                tooltipDispatch({type:"HIDE"})
                                event.dataTransfer.setData("myfilesystem/filepath", pathClean(currentFolder.path + "/" +item[0]))
                            }}
                        >
                            {/* goated  */}
                            <div className="icon"><img draggable= "false" src={itemType == "FILE" ? fileThumbnailGetter((item[1] as MyFileSystemFile).type as MyFileSystemFile["type"]) :"https://www.svgrepo.com/show/535397/folder-open.svg"} alt="" /></div>
                            <div className="name">{(item[0])}</div>
                        </div>
                    )
                })
            }
        </div>
    </div>
    )
}