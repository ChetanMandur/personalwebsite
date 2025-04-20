import React, { useContext, useEffect, useState } from "react"
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

    useEffect(()=>{
        const intervalID = setInterval(()=>{setCurrentOptions(pendingState=>{
            if (!videoRef.current?.paused){
                setCurrentFormOptions(pendingState=>({currentTime:videoRef.current!.currentTime, playbackRate: pendingState.playbackRate}))
            }
            return {...pendingState, currentTime: videoRef.current!.currentTime, playing: !videoRef.current?.paused}
        })
        
        
        }, 0)

        return ()=>{
            clearInterval(intervalID)
        }

    },[])


    function changeValue<T extends keyof VideoUpdatableOptions>(newOptionKey: T, newOptionValue: VideoUpdatableOptions[T]){
        // console.log(newOptionKey, newOptionValue)
        setCurrentOptions(pendingState =>({...pendingState, [newOptionKey]:newOptionValue}))
        updateVideoCustomOptions(newOptionKey, newOptionValue)
    }


    function applyBeatPadValue(beatPadValue: BeatPadValue){
        changeValue("currentTime", beatPadValue.timeStamp)
        changeValue("playbackRate", beatPadValue.playbackRate)
        changeValue("preservesPitch", beatPadValue.preservesPitch)
        setCurrentFormOptions({currentTime: beatPadValue.timeStamp, playbackRate: beatPadValue.playbackRate})
    }
    
    

    function hexToRGB(hex:string):[red:number, green:number, blue:number]{
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        // return {red:r, green:g, blue:b} 
        return [ r, g, b ];
    }

    function rgbToHex(red:number, green:number, blue:number):string{
        const redHex = red.toString(16)
        const greenHex = green.toString(16)
        const blueHex = blue.toString(16)

        return "#"
            +(redHex.length == 1 ? "0" + redHex : redHex)
            +(greenHex.length == 1 ? "0" + greenHex : greenHex)
            +(blueHex.length == 1 ? "0" + blueHex : blueHex)
    }


    return (
        <>
            <div className="media-controller-section">
                <div className="media-controller-section-titlebar">
                    Progress Bar
                </div>
                <div className="media-controller-section-progressbar">
                    <div className="media-controller-section-progressbar-playpause-button common-border" onClick={()=>{changeValue("playing", Boolean(!currentOptions.playing))}}><img src={currentOptions.playing == false ? "https://www.svgrepo.com/show/486784/play.svg " : "https://www.svgrepo.com/show/506666/pause.svg"} alt="" /> </div>
                    <input type="range"  tabIndex={-1} value={currentOptions.currentTime} min={0} max={videoRef.current?.duration} step={0.000001} onChange={(event)=>{changeValue("currentTime", Number(event.target.value))}} name="currentTime" id="currentTime" />

                </div>
                <input type="number" placeholder="0"  value={currentFormOptions.currentTime || ''} min={0} max={videoRef.current!.duration}
                    step={0.000001}
                    onChange={(event)=>{
                        const targetValue = Number(Number(event.target.value).toFixed(6))
                        if (targetValue >= 0 && targetValue <= videoRef.current!.duration){
                            setCurrentFormOptions(pendingState=>({currentTime:targetValue, playbackRate: pendingState.playbackRate}))
                        }
                    }}
                    onKeyDown={(event)=>{
                        switch (event.key) {
                            case "-":
                                event.preventDefault()
                                break;
                            case "Enter":
                                event.currentTarget.blur()
                                break;
                            default:
                                break;
                        }
                    }}
                    onBlur={()=>{
                        changeValue("currentTime", currentFormOptions.currentTime)
                    }}
                />

            </div>
            <div className="media-controller-section">
                <div className="media-controller-section-titlebar">
                    Preserve Pitch
                </div>
                <input type="checkbox" tabIndex={-1} checked={currentOptions.preservesPitch} onChange={()=>{changeValue("preservesPitch", Boolean(!currentOptions.preservesPitch))}} name="perservePitch" id="perservePitch" />
            </div>

            <div className="media-controller-section">
                <div className="media-controller-section-titlebar">
                    Playback Rate
                </div>
                <input type="range" tabIndex={-1} value={currentOptions.playbackRate} min={0} max={2} step={0.1} 
                onChange={(event)=>{
                    changeValue("playbackRate", Number(event.target.value)); 
                    setCurrentFormOptions((pendingState)=>({...pendingState, playbackRate: Number(event.target.value)}))
                }} 
                name="playbackRate" id="playbackRate" />
                <input type="number" placeholder="0"  value={currentFormOptions.playbackRate || ''} min={0} max={2} step={0.1}
                    onChange={(event)=>{
                        const targetValue = Number(Number(event.target.value).toFixed(1))
                        if (targetValue >= 0 && targetValue <= 2){
                            setCurrentFormOptions(pendingState=>({playbackRate:targetValue, currentTime: pendingState.currentTime}))
                        }
                    }}
                    onKeyDown={(event)=>{
                        switch (event.key) {
                            case "-":
                                event.preventDefault()
                                break;
                            case "Enter":
                                event.currentTarget.blur()
                                break;
                            default:
                                break;
                        }
                    }}
                    onBlur={()=>{
                        changeValue("playbackRate", currentFormOptions.playbackRate)
                    }}
                />
            </div>
            <div className="media-controller-section-holder">
                <div className="media-controller-section">
                    <div className="media-controller-section-titlebar">
                        Grayscale
                    </div>
                    <input type="checkbox" tabIndex={-1} checked={currentOptions.grayscale} onChange={()=>{changeValue("grayscale", Boolean(!currentOptions.grayscale))}} name="grayscale" id="grayscale" />
                </div>
                <div className="media-controller-section">
                    <div className="media-controller-section-title">
                        Inverse
                    </div>
                    <input type="checkbox" tabIndex={-1} checked={currentOptions.inverseColour} onChange={()=>{changeValue("inverseColour", Boolean(!currentOptions.inverseColour))}} name="inverseColour" id="inverseColour" />
                </div>
            </div>

            <div className="media-controller-section">
                <div className="media-controller-section-titlebar">
                    Beat Pad
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
                <div className="beat-pad-section">
                    {
                        Object.entries(beatPadMappings.list).map((item, index)=>{
                            const [currentKeyCode, currentBeatPadValue] = item
                            
                            return(
                                <div className="beat-pad-section-value common-border" key={"beat-pad-value"+index}
                                    onClick={()=>{applyBeatPadValue(currentBeatPadValue)}}
                                    onContextMenu={(event)=>{
                                        contextMenuPropagation(event)
                                        contextMenuDispatch({
                                            type:"SET",
                                            event: event,
                                            newOptions:{
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
                                    {index} <br/>
                                    {/* {currentBeatPadValue.keycode != null ? <>{currentBeatPadValue.keycode} <br/></>: (
                                        beatPadMappings.toMap == index ? <>Press a key<br/></> : <>Unassigned<br/></>
                                    )} */}
                                    {beatPadMappings.toMap == currentKeyCode ? <>Press a key <br/></>: (
                                        currentKeyCode.substring(0,6) != "NO_KEY" ? <>{currentKeyCode} <br/></> : <>Unassigned<br/></>
                                    )}
                                    {currentBeatPadValue.preservesPitch ? <>True</> : <>False</>} <br/>
                                    {currentBeatPadValue.playbackRate} <br/>
                                    {currentBeatPadValue.timeStamp} <br/>
                                </div>
                            )
                        })
                    }
                </div>
            </div>

            <div className="media-controller-section">
                <div className="media-controller-section-titlebar">
                    Colour Swap
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
                    <div className="colour-swap-add common-border" onClick={()=>{
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
                            //Grab random pixel
                            let randomPixel = (Math.floor(Math.random() * (frameData.length/4)))

                            //If random pixel has been changed, keep selecting new one until we find one that hasnt been changed
                            while (currentOptions.colourSwapList.changedPixels.current!.has(randomPixel)){ 
                                randomPixel = (Math.floor(Math.random() * (frameData.length/4)))
                            }
                            
                            //Find RGB value of random pixel
                            const randomPixelGroup = randomPixel * 4

                            const fromRed = frameData[randomPixelGroup + 0]
                            const fromGreen = frameData[randomPixelGroup + 1]
                            const fromBlue = frameData[randomPixelGroup + 2]

                            // Generate new RGB value
                            const toRed = Math.floor(Math.random() * (256))
                            const toGreen = Math.floor(Math.random() * (256))
                            const toBlue = Math.floor(Math.random() * (256))
        
        
                                changeValue("colourSwapList", {
                                    values: [...currentOptions.colourSwapList.values, {
                                        from:{red:fromRed, green:fromGreen, blue:fromBlue, alpha:0},
                                        to:{red:toRed, green:toGreen, blue:toBlue, alpha:0},
                                        range:Math.floor(Math.random() * (100))
                                    }],
                                    changedPixels: currentOptions.colourSwapList.changedPixels
                                })
                        }

                        if (currentOptions.colourSwapList.changedPixels.current!.size == totalPixels){
                            console.log("no pixels in current frame to randomize")
                        }
                    }}>Random</div>
                </div>
                <div className="color-swap-section">
                    {
                        currentOptions.colourSwapList.values.map(
                            (value, index)=>{
                                
                                return(
                                    <div className="colour-swap-section-value" key={"colour-swap-value"+index}>
                                        <div className="colour-swap-section-value-option">
                                            FROM:
                                            <input type="color" value={rgbToHex(value.from.red, value.from.green, value.from.blue)} name="from-color-swap" id="from-color-swap"
                                                
                                                onChange={(event)=>{
                                                    [value.from.red, value.from.green, value.from.blue] = hexToRGB(event.target.value)
                                                    currentOptions.colourSwapList.values[index] = value
                                                    changeValue("colourSwapList", {
                                                        values: currentOptions.colourSwapList.values,
                                                        changedPixels: currentOptions.colourSwapList.changedPixels
                                                    })
                                                }}
                                            />
                                        </div>

                                        <div className="colour-swap-section-value-option">
                                            TO:
                                            <input type="color" value={rgbToHex(value.to.red, value.to.green, value.to.blue)} name="to-color-swap" id="to-color-swap"
                                                onChange={(event)=>{
                                                    [value.to.red, value.to.green, value.to.blue] = hexToRGB(event.target.value)
                                                    currentOptions.colourSwapList.values[index] = value
                                                    changeValue("colourSwapList", {
                                                        values: currentOptions.colourSwapList.values,
                                                        changedPixels: currentOptions.colourSwapList.changedPixels
                                                    })
                                                }}
                                            />
                                        </div>
                                        
                                        <div className="colour-swap-section-value-option" >
                                            RANGE:
                                            <input type="number" className="colour-swap-section-value-option-number" placeholder="0" value={value.range || ''} min={0} max={255}
                                                onChange={(event)=>{
                                                    const targetValue = Number(event.target.value)
                                                    if (targetValue >= 0 && targetValue <= 255){
                                                        value.range = targetValue
                                                        currentOptions.colourSwapList.values[index] = value
                                                        changeValue("colourSwapList", {
                                                            values: currentOptions.colourSwapList.values,
                                                            changedPixels: currentOptions.colourSwapList.changedPixels
                                                        })
                                                    }
                                                }}
                                                onKeyDown={(event)=>{
                                                    switch (event.key) {
                                                        case "-":
                                                            event.preventDefault()
                                                            break;
                                                        case "Enter":
                                                            event.currentTarget.blur()
                                                            break;
                                                        default:
                                                            break;
                                                    }
                                                }}
                                            />
                                        </div>

                                        <div className="colour-swap-delete common-border" onClick={()=>{
                                            currentOptions.colourSwapList.values.splice(index, 1)
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