import { useContext, useEffect, useState } from "react"
import { VideoMediaControllerProps } from "../MediaController";
import { RunningAppsContext } from "../../../Desktop/Contexts/RunningAppsContext"
import { VideoUpdatableOptions } from "../../MediaViewer/VideoMedia/VideoMedia"
import { ContextMenuContext, contextMenuPropagation } from "../../../Desktop/Contexts/ContextMenuContext"
import "./VideoMediaController.css"

// Typing used to represent a single beat pad
// Supposed to be akin to a beat pad/square on a sampler/drum machine
// The information contains:
    // The timestamp of the video that the beat pad jumps to (timeStamp)
    // The playback rate/speed used by the beat pad (playbackRate)
    // Whether or not the video perserves the original pitch (preservesPitch)
type BeatPadValue = {
    timeStamp: number,
    playbackRate: number,
    preservesPitch: boolean
}

// Typing used to represent a list of `BeatPadValue`
// The key is used to represent the keyboard key assigned to the BeatPadValue
// If no keyboard key is assigned, then the key is assigned a "NO_KEY" + {random number}  
type BeatPadMappingList = {
    [key:string]: BeatPadValue
}

// Typing used to represent the complete state of the beat pad
// Holds a list of `BeatPadValue`s and also whether or not there is a BeatPadValue looking to be mapped
// The information contains:
    // The key for the `BeatPadValue` (from `BeatPadMappingList`) that is looking to be mapped to a keyboard key (toMap)
    // The list of `BeatPadValue` that is currently being used (list)
type BeatPadMapping ={
    toMap: string | null,
    list: BeatPadMappingList
}

// Typing used to represent the form values used by any number inputs (ie. input[number])
// The information contains:
    // The value for the number input representing the elapsed time, found underneath the seekbar (currentNumber)
    // The value for the number input representing the current playback rate, found unerneath the playbackRate slider (playbackRate)
type FormValues = {
    currentTime: number,
    playbackRate: number,
}

export function VideoMediaController({app_running_id,startingValues, videoRef,canvasRef, updateVideoCustomOptions, setControllerAppRunningID}:VideoMediaControllerProps){
    // State for storing all current values for the video/controller
    const [currentOptions, setCurrentOptions] = useState<VideoUpdatableOptions>(startingValues)

    // State for storing all current form (ie. number inputs) values 
    const [currentFormOptions, setCurrentFormOptions] = useState<FormValues>({currentTime:startingValues.currentTime, playbackRate: startingValues.playbackRate})
    
    // State for storing all beatpad properties
    const [beatPadMappings, setBeatPadMappings] = useState<BeatPadMapping>({toMap: null, list: {}})

    // Used to provide a context menu for each individual beatpad
    const {contextMenuDispatch} = useContext(ContextMenuContext)

    // Used to check if the controller is currently being focused by the user
    const {runningAppsData} = useContext(RunningAppsContext)

    const hasFocus = runningAppsData[app_running_id].zIndex == 999


    // Used to set/update the key handler used for using the beatpad
    // Updates each time the controller gets focus from the user OR when beatPadMappings is updated
    useEffect(()=>{

        // Main keydown handler function
        function keyDownHandler(event:KeyboardEvent){
            // User must have focus with the controller for beat pad to be functional
            if (hasFocus){

                // If the beatpad is currently not looking to map a pad
                if (beatPadMappings.toMap == null){

                    // If the key pressed is mapped to a pad
                    if (beatPadMappings.list[event.key]){
                        // Apply the beat pad
                        applyBeatPadValue(beatPadMappings.list[event.key])

                    }

                }

                // If the beatpad is currently looking to map a pad
                else{
                    
                    // If the key pressed is currently NOT mapped to a pad
                    if (!beatPadMappings.list[event.key]){
                        // Convert the list of BeatPadValues into an array
                            // This is done so that the order of the pads stays the same
                            // If object is directly updated with delete/inserts, the pad is moved to the bottom of the list
                        const beatPadMappingsListArray = Object.entries(beatPadMappings.list)

                        // Parse thru the entire array
                        for (let index=0; index< beatPadMappingsListArray.length; index++){
                            // Create a copy of the pad at the index
                            const currentBeatPadValue = beatPadMappingsListArray[index]

                            // If the current pad has the key that is to be mapped
                            if (currentBeatPadValue[0] == beatPadMappings.toMap){
                                
                                // Update the copy with the new keyboard key
                                currentBeatPadValue[0] = event.key;

                                // Update the value @ index with the new copy
                                beatPadMappingsListArray[index] = currentBeatPadValue;
                                
                                // Apply the new list to BeatPadMappings
                                setBeatPadMappings({toMap:null, list: Object.fromEntries(beatPadMappingsListArray)});
                                break;
                            }
                        }
                    }
                    // If the key pressed is the same as the one currently mapped to the pad looking to be remapped...
                    // ... keep the list the same, and stop looking to map a pad
                    else if(event.key == beatPadMappings.toMap){
                        setBeatPadMappings({toMap:null, list: beatPadMappings.list})

                    }
                }
            }
        }
        
        // Adds the key handler function to the whole website's 'keydown' event listener
        document.addEventListener("keydown", keyDownHandler)

        // Before updating/dismounting, remove the event listener currently set
        return () => document.removeEventListener("keydown", keyDownHandler)
    },[hasFocus, app_running_id, beatPadMappings])


    // Purpose of useEffect is to send its app running id back to the original video media
    // Purpose is to allow the video media to close the controller when the video media is closed
    // When the controller is closed (and not the video media), the controller unlinks itself from the video media
        // This is done by setting the video media's controller app running id back to empty/nothing
    // Is run at launch of the video media (and also if either the setting function or the controller's app running id is ever changed)
        // (Although the latter would never happen (as of writing this message (and hopefully forever)))
    useEffect(()=>{
        setControllerAppRunningID(app_running_id)

        return ()=>{
            setControllerAppRunningID("")

        }
    },[app_running_id, setControllerAppRunningID])

    // Purpose of the useEffect is to create/restart the loop used to update the current time used for the controller
    // Without this loop, the controller's range input (progress bar) would not update according to the video's elapsed time
    useEffect(()=>{
        // Creates the interval (which is run ASAP, denoted by timeout=0) and stores its ID
        const intervalID = setInterval(()=>{
            
            // Updates the current time state to match that of the video
                // This is needed as it keeps the controller's elapsed time in sync with that of the video
                    // Without it, changes to the elapsed time from the video player's controls wont be shown on the controller, causing a desync
                // Updates pending state to ensure that no other state changes are ignored
            setCurrentOptions(pendingState=>{
                return {...pendingState, currentTime: videoRef.current!.currentTime, playing: !videoRef.current?.paused}
            })
        }, 0)

        // Removes/clears the interval @ unmount or during reset
        return ()=>{
            clearInterval(intervalID)
        }

    },[])

    // Purpose of the useEffect is to keep the number input (text underneath progress bar, denoting the elapsed time) in sync with the video/progress bar
    // By keeping it in a seperate useEffect (and not within the loop above) allows for the number input to be manipulated
        // If it were in the loop, the input would constantly be updated with the current time, ignoring any user input
        // In a seperate loop, it only applies/is run when the variable is changed to a different value
    useEffect(()=>{
        setCurrentFormOptions(pendingState=>({currentTime:currentOptions.currentTime, playbackRate: pendingState.playbackRate}))
    }, [currentOptions.currentTime])


    /**
     * The purpose of this function is to update the current video options for both the controller and the source video media 
     * 
     * Goal is to unify both updates into one function so that both states stay synced with each other
     * @param newOptionKey The key used to indicate which option is being changed
     * @param newOptionValue The new value for the option being changed
     */
    function changeValue<T extends keyof VideoUpdatableOptions>(newOptionKey: T, newOptionValue: VideoUpdatableOptions[T]){
        setCurrentOptions(pendingState =>({...pendingState, [newOptionKey]:newOptionValue}))
        updateVideoCustomOptions(newOptionKey, newOptionValue)
    }


    /**
     * The purpose of this function is to apply a beat pad (ie. apply the values it stores) to the video
     * 
     * This is done by using the `changeValue()` function for each of the beat pad's values
     * @param beatPadValue The `BeatPadValue` that is to be applied
     */
    function applyBeatPadValue(beatPadValue: BeatPadValue){
        changeValue("currentTime", beatPadValue.timeStamp)
        changeValue("playbackRate", beatPadValue.playbackRate)
        changeValue("preservesPitch", beatPadValue.preservesPitch)
        setCurrentFormOptions({currentTime: beatPadValue.timeStamp, playbackRate: beatPadValue.playbackRate})
    }
    
    
    /**
     * The purpose of this function is to return the RGB colour value of a hex colour value
     * 
     * The goal of this function is to read the colour input's value in RGB format (as it is in hex format originally).
     * 
     * This is needed as the values stored in `currentOptions.colourSwapList.values` are in RGB format (since reading canvas data returns RGB pixel values)
     * @param hex The colour value (in hex `string` format) to be converted to RGB `string` format
     * @returns The equivalent value in RGB `string` format
     */
    function hexToRGB(hex:string):[red:number, green:number, blue:number]{
        // Hex colour values are given in #RRGGBB format
            // RR, GG, and BB are numbers in base 16
        // Split the original hex string such that RR, GG, and BB are placed in seperate variables
            // Before setting into the variable, convert the number from base 16 to base 10 (what RGB uses)
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        // Return the RGB values as seperate variables
        return [ r, g, b ];
    }

    /**
     * The purpose of this function is to return the hex colour value of a RGB colour value
     * 
     * The goal of this function is to apply the RGB values stored in `currentOptions.colourSwapList.values` to a colour input 
     * 
     * This is needed since colour inputs only take hex values for their value
     * @param red Represents the amount of red within the colour as a number in `string` format
     * @param green Represents the amount of green within the colour as a number in `string` format
     * @param blue Represents the amount of blue within the colour as a number in `string` format
     * @returns The equivalent value in hex `string` format
     */
    function rgbToHex(red:number, green:number, blue:number):string{
        // Since the R,G and B values are in base 10, we need to convert each value into base 16
        const redHex = red.toString(16)
        const greenHex = green.toString(16)
        const blueHex = blue.toString(16)

        // For hex colour values in format #RRGGBB, all numbers (RR,GG, and BB) must be two digits long
        // If a value is only one digit long, it needs an extra 0 at the start so that it will be two digits long in hex format
        return "#"
            +(redHex.length == 1 ? "0" + redHex : redHex)
            +(greenHex.length == 1 ? "0" + greenHex : greenHex)
            +(blueHex.length == 1 ? "0" + blueHex : blueHex)
    }


    return (
        // Since this is rendered within `MediaController.tsx`, the parent class of `.media-controller` is within that component
        // So, for this component, the main encapsulating parent is a fragment 
        <>
            {/* Section dedicated for play/pause button + progress bar (with elapsed time text) */}
            <div className="media-controller-section">
                {/* Title for section */}
                <div className="media-controller-section-titlebar">
                    Progress Bar
                </div>
                {/* Section for play/pause button + progress bar  */}
                <div className="media-controller-section-progressbar">
                    {/* Play/pause button */}
                    <div className="media-controller-section-progressbar-playpause-button common-border" onClick={()=>{changeValue("playing", Boolean(!currentOptions.playing))}}>
                            <img src={currentOptions.playing == false ? "https://www.svgrepo.com/show/486784/play.svg " : "https://www.svgrepo.com/show/506666/pause.svg"} alt="" /> 
                    </div>
                    {/* Progress bar as a range input */}
                    <input type="range"  tabIndex={-1} value={currentOptions.currentTime} min={0} max={videoRef.current?.duration} step={0.000001} onChange={(event)=>{changeValue("currentTime", Number(event.target.value))}} name="currentTime" id="currentTime" />

                </div>

                {/* Number input representing the elapsed time/duration text 
                    Used as a number input so that it is interactable/able to be edited
                */}
                <input type="number" placeholder="0"  value={currentFormOptions.currentTime || ''} min={0} max={videoRef.current!.duration}
                    step={0.000001}
                    // Handles changes to the text
                    onChange={(event)=>{
                        // Round to sixth decimal place
                        const targetValue = Number(Number(event.target.value).toFixed(6))
                        // Only apply if value would be in range
                        if (targetValue >= 0 && targetValue <= videoRef.current!.duration){
                            setCurrentFormOptions(pendingState=>({currentTime:targetValue, playbackRate: pendingState.playbackRate}))
                        }
                    }}

                    // Some keys are to have unique effects
                    onKeyDown={(event)=>{
                        switch (event.key) {
                            // No negative numbers are allowed
                            case "-":
                                event.preventDefault()
                                break;
                            
                            // Pressing 'Enter' signifies that the user wishes to apply changes/unfocus
                            case "Enter":
                                event.currentTarget.blur()
                                break;
                            

                            default:
                                break;
                        }
                    }}
                    
                    // When the input field is unfocused, apply the current time to the video
                    onBlur={()=>{
                        changeValue("currentTime", currentFormOptions.currentTime)
                    }}
                />
            </div>

            {/* Section dedicated for the perserve pitch option */}
            <div className="media-controller-section">
                {/* Title for the section */}
                <div className="media-controller-section-titlebar">
                    Preserve Pitch
                </div>
                
                {/* Checkbox to enable/disable the ability to preserve pitch */}
                <input type="checkbox" tabIndex={-1} checked={currentOptions.preservesPitch} onChange={()=>{changeValue("preservesPitch", Boolean(!currentOptions.preservesPitch))}} name="perservePitch" id="perservePitch" />
            </div>
            
            {/* Section dedicated for the playback rate slider + number input */}
            <div className="media-controller-section">
                {/* Title for the section */}
                <div className="media-controller-section-titlebar">
                    Playback Rate
                </div>

                {/* Playback rate slider as range input */}
                <input type="range" name="playbackRate" id="playbackRate"  tabIndex={-1} value={currentOptions.playbackRate} min={0} max={2} step={0.1} 
                onChange={(event)=>{
                    changeValue("playbackRate", Number(event.target.value)); 
                    setCurrentFormOptions((pendingState)=>({...pendingState, playbackRate: Number(event.target.value)}))
                }} />

                {/* Playback rate text as number input 
                    Used as number input so that it can be edited/interactable
                */}
                <input type="number" placeholder="0"  value={currentFormOptions.playbackRate || ''} min={0} max={2} step={0.1}
                    onChange={(event)=>{
                        // Round input to first decimal place
                        const targetValue = Number(Number(event.target.value).toFixed(1))
                        // Apply value if number would be in range
                        if (targetValue >= 0 && targetValue <= 2){
                            setCurrentFormOptions(pendingState=>({playbackRate:targetValue, currentTime: pendingState.currentTime}))
                        }
                    }}

                    // Some keys are to have unique effects
                    onKeyDown={(event)=>{
                        switch (event.key) {
                            // No negative numbers are allowed
                            case "-":
                                event.preventDefault()
                                break;
                            
                            // Pressing 'Enter' signifies that the user wishes to apply changes/unfocus
                            case "Enter":
                                event.currentTarget.blur()
                                break;
                            default:
                                break;
                        }
                    }}

                    // When the input is unfocused, apply the playback rate to the video
                    onBlur={()=>{
                        changeValue("playbackRate", currentFormOptions.playbackRate)
                    }}
                />
            </div>

            {/* Section dedicated for grayscale/inverse colour options */}
            <div className="media-controller-section-holder">
                {/* For grayscale */}
                <div className="media-controller-section">
                    {/* Title for section */}
                    <div className="media-controller-section-titlebar">
                        Grayscale
                    </div>
                    {/* Checkbox to enable/disable grayscale */}
                    <input type="checkbox" tabIndex={-1} checked={currentOptions.grayscale} onChange={()=>{changeValue("grayscale", Boolean(!currentOptions.grayscale))}} name="grayscale" id="grayscale" />
                </div>
                {/* For inverse colour */}
                <div className="media-controller-section">
                    {/* Title for section */}
                    <div className="media-controller-section-title">
                        Inverse
                    </div>
                    {/* Checkbox to enable/disable inverse colour */}
                    <input type="checkbox" tabIndex={-1} checked={currentOptions.inverseColour} onChange={()=>{changeValue("inverseColour", Boolean(!currentOptions.inverseColour))}} name="inverseColour" id="inverseColour" />
                </div>
            </div>

            {/* Section dedicated for the beat pad */}
            <div className="media-controller-section">
                {/* Beatpad titlebar + buttons */}
                <div className="media-controller-section-titlebar">
                    Beat Pad

                    {/* '+' button, used to add a new beat pad 
                    (default values are the video's current values) */}
                    <div className="media-controller-section-titlebar-button common-border"
                        onClick={()=>{
                            let randomKey: string = "NO_KEY" + Math.random().toString()
                            while (beatPadMappings.list[randomKey]){
                                randomKey = "NO_KEY" + Math.random().toString()
                            }
                            beatPadMappings.list[randomKey] = {
                                timeStamp: currentOptions.currentTime,
                                playbackRate: currentOptions.playbackRate,
                                preservesPitch: currentOptions.preservesPitch
                                
                            }
                            setBeatPadMappings(beatPadMappings)
                        }}
                    >
                        +
                    </div>
                </div>
                {/* Where each beat pad is displayed */}
                <div className="beat-pad-section">
                    {
                        // For each beat pad
                        Object.entries(beatPadMappings.list).map((item, index)=>{
                            const [currentKeyCode, currentBeatPadValue] = item
                            
                            // Create the beatpad
                            return(
                                // Main encapsulating div
                                <div className="beat-pad-section-value common-border" key={"beat-pad-value"+index}
                                    onClick={()=>{applyBeatPadValue(currentBeatPadValue)}}
                                    onContextMenu={(event)=>{
                                        contextMenuPropagation(event)
                                        contextMenuDispatch({
                                            type:"SET",
                                            event: event,
                                            options:{
                                                "Delete pad": ()=>{
                                                    delete beatPadMappings.list[currentKeyCode]
                                                    setBeatPadMappings(beatPadMappings)

                                                },
                                                "Update pad with current": ()=>{
                                                    setCurrentOptions(pendingState =>{
                                                        beatPadMappings.list[currentKeyCode] = {
                                                            ...currentBeatPadValue, 
                                                            timeStamp: pendingState.currentTime,
                                                            playbackRate: pendingState.playbackRate,
                                                            preservesPitch: pendingState.preservesPitch
                                                        }
                                                        setBeatPadMappings(beatPadMappings)
                                                        return pendingState
                                                    })
                                                    
                                                },
                                                "Update pad timestamp": ()=>{
                                                    setCurrentOptions(pendingState =>{
                                                        beatPadMappings.list[currentKeyCode] = {
                                                            ...currentBeatPadValue, 
                                                            timeStamp: pendingState.currentTime,
                                                        }
                                                        setBeatPadMappings(beatPadMappings)
                                                        return pendingState
                                                    })
                                                },
                                                "Update pad playbackrate": ()=>{
                                                    setCurrentOptions(pendingState =>{
                                                        beatPadMappings.list[currentKeyCode] = {
                                                            ...currentBeatPadValue, 
                                                            playbackRate: pendingState.playbackRate,
                                                        }
                                                        setBeatPadMappings(beatPadMappings)
                                                        return pendingState
                                                    })
                                                },
                                                "Swap pad preserve pitch": ()=>{
                                                    beatPadMappings.list[currentKeyCode] = {
                                                        ...currentBeatPadValue, 
                                                        preservesPitch: !currentBeatPadValue.preservesPitch
                                                    }
                                                    setBeatPadMappings(beatPadMappings)
                                                },
                                                "Set key value": ()=>{
                                                    setBeatPadMappings({toMap: currentKeyCode, list: beatPadMappings.list})
                                                }
                                            }
                                        })
                                    }}
                                
                                >
                                    {/* Contents of the beat pad item */}
                                    {index} <br/>
                                    {beatPadMappings.toMap == currentKeyCode ? <>Press a key <br/></>: (
                                        currentKeyCode.substring(0,6) != "NO_KEY" ? <>{currentKeyCode} <br/></> : <>Unassigned<br/></>
                                    )}
                                    {currentBeatPadValue.preservesPitch ? <>True</> : <>False</>} <br/>
                                    {currentBeatPadValue.playbackRate}x <br/>
                                    {currentBeatPadValue.timeStamp} <br/>
                                </div>
                            )
                        })
                    }
                </div>
            </div>

            {/* Section dedicated for the colour swap options */}
            <div className="media-controller-section">
                {/* Titlebar + buttons */}
                <div className="media-controller-section-titlebar">
                    Colour Swap
                    {/* '+' button, used to add a new colour swap value (default values are swapping black with black within a range of 0) */}
                    <div className="media-controller-section-titlebar-button common-border" onClick={()=>{
                        changeValue("colourSwapList", {
                            values:[...currentOptions.colourSwapList.values, {
                                from:{red:0, green:0, blue:0, alpha:0},
                                to:{red:0, green:0, blue:0, alpha:0},
                                range:0
                            }],
                            changedPixels: currentOptions.colourSwapList.changedPixels
                        })
                    }}>+</div>

                    {/* 'Random' button, used to add a new colour swap value based on the pixels current on screen */}
                    <div className="media-controller-section-titlebar-button common-border" onClick={()=>{

                        // Get the current frame + its accompanying data
                        const canvasContext = canvasRef.current!.getContext("2d")! 
                        const videoFrame = canvasContext.getImageData(
                            0,
                            0,
                            canvasRef.current!.width, 
                            canvasRef.current!.height
                        )
                        const frameData = videoFrame.data
                        const totalPixels = frameData.length/4

                        // If all the pixels have not been changed
                        if (currentOptions.colourSwapList.changedPixels.current!.size != totalPixels ){
                            // Grab random pixel (from pool of all pixels)
                            let randomPixel = (Math.floor(Math.random() * (totalPixels)))

                            // If random pixel has been changed, keep selecting new one until we find one that hasnt been changed
                            while (currentOptions.colourSwapList.changedPixels.current!.has(randomPixel)){ 
                                randomPixel = (Math.floor(Math.random() * (totalPixels)))
                            }
                            
                            // Find RGB value of random pixel
                            const randomPixelIndex = randomPixel * 4

                            const fromRed = frameData[randomPixelIndex + 0]
                            const fromGreen = frameData[randomPixelIndex + 1]
                            const fromBlue = frameData[randomPixelIndex + 2]

                            // Generate new RGB value for random pixel to swap to
                            const toRed = Math.floor(Math.random() * (256))
                            const toGreen = Math.floor(Math.random() * (256))
                            const toBlue = Math.floor(Math.random() * (256))
        
                            // Create new colour swap values with:
                                // RGB value of random pixel 
                                // The newly genereated RGB value to swap to
                                // Random range value (from 0-100)
                            changeValue("colourSwapList", {
                                values: [...currentOptions.colourSwapList.values, {
                                    from:{red:fromRed, green:fromGreen, blue:fromBlue, alpha:0},
                                    to:{red:toRed, green:toGreen, blue:toBlue, alpha:0},
                                    range:Math.floor(Math.random() * (100))
                                }],
                                changedPixels: currentOptions.colourSwapList.changedPixels
                            })
                        }

                        // If all pixels have been changed/swapped, do nothing (other than this console message)
                        if (currentOptions.colourSwapList.changedPixels.current!.size == totalPixels){
                            console.log("no pixels in current frame to randomize")
                        }
                    }}>Random</div>
                </div>
                {/* Where each colour swap value is displayed */}
                <div className="color-swap-section">
                    {
                        // For each colour swap value
                        currentOptions.colourSwapList.values.map(
                            (value, index)=>{
                                
                                // Create the colour swap value
                                return(
                                    // Main encapsulating div
                                    <div className="colour-swap-section-value" key={"colour-swap-value"+index}>
                                        {/* Colour input for the 'from' value */}
                                        <div className="colour-swap-section-value-option">
                                            FROM:
                                            <input type="color" value={rgbToHex(value.from.red, value.from.green, value.from.blue)} name="from-color-swap" id="from-color-swap"
                                                
                                                onChange={(event)=>{
                                                    // Given value is in hex format, need to convert before applying to colour swap value
                                                    [value.from.red, value.from.green, value.from.blue] = hexToRGB(event.target.value)
                                                    // Reapply modified value @ index
                                                    currentOptions.colourSwapList.values[index] = value
                                                    changeValue("colourSwapList", {
                                                        values: currentOptions.colourSwapList.values,
                                                        changedPixels: currentOptions.colourSwapList.changedPixels
                                                    })
                                                }}
                                            />
                                        </div>

                                        {/* Colour input for the 'to' value */}
                                        <div className="colour-swap-section-value-option">
                                            TO:
                                            <input type="color" value={rgbToHex(value.to.red, value.to.green, value.to.blue)} name="to-color-swap" id="to-color-swap"
                                                onChange={(event)=>{
                                                    // Given value is in hex format, need to convert before applying to colour swap value
                                                    [value.to.red, value.to.green, value.to.blue] = hexToRGB(event.target.value)
                                                    // Reapply modified value @ index
                                                    currentOptions.colourSwapList.values[index] = value
                                                    changeValue("colourSwapList", {
                                                        values: currentOptions.colourSwapList.values,
                                                        changedPixels: currentOptions.colourSwapList.changedPixels
                                                    })
                                                }}
                                            />
                                        </div>
                                        
                                        {/* Number input for the 'range' value */}
                                        <div className="colour-swap-section-value-option" >
                                            RANGE:
                                            <input type="number" className="colour-swap-section-value-option-number" placeholder="0" value={value.range || ''} min={0} max={255}
                                                onChange={(event)=>{
                                                    const targetValue = Number(event.target.value)
                                                    // Apply value if number would be in range
                                                    if (targetValue >= 0 && targetValue <= 255){
                                                        // Update value
                                                        value.range = targetValue
                                                        // Reapply value @ index
                                                        currentOptions.colourSwapList.values[index] = value
                                                        changeValue("colourSwapList", {
                                                            values: currentOptions.colourSwapList.values,
                                                            changedPixels: currentOptions.colourSwapList.changedPixels
                                                        })
                                                    }
                                                }}
                                                // Some keys are to have unique effects
                                                onKeyDown={(event)=>{
                                                    switch (event.key) {
                                                        // No negative numbers are allowed
                                                        case "-":
                                                            event.preventDefault()
                                                            break;
                                                        // Pressing 'Enter' signifies that the user wishes to apply changes/unfocus
                                                        case "Enter":
                                                            event.currentTarget.blur()
                                                            break;
                                                        default:
                                                            break;
                                                    }
                                                }}
                                            />
                                        </div>
                                            
                                        {/* Button to delete colour swap value */}
                                        <div className="colour-swap-delete common-border" onClick={()=>{
                                            // Remove current index from values list
                                            currentOptions.colourSwapList.values.splice(index, 1)
                                            // Reapply list into state
                                            changeValue("colourSwapList", {
                                                values: currentOptions.colourSwapList.values,
                                                changedPixels: currentOptions.colourSwapList.changedPixels
                                            })
                                        }}>Remove</div>
                                    </div>
                                )
                            }
                        )
                    }
                </div>
            </div>
        </>
    )


}