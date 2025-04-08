import React, { useContext, useEffect, useState } from "react"
import { AppRunningID, RunningAppsContext } from "../../Desktop/Contexts/RunningAppsContext"
import "./MediaController.css"
import { VideoUpdatableOptions } from "../MediaViewer/VideoMedia/VideoMedia"
import { ContextMenuContext, contextMenuPropagation } from "../../Desktop/Contexts/ContextMenuContext"

export type MediaControllerProps = AppRunningID & {
    startingValues: VideoUpdatableOptions,
    videoRef: React.MutableRefObject<HTMLVideoElement | null>,
    canvasRef:React.MutableRefObject<HTMLCanvasElement | null>,
    updateVideoCustomOptions: <T extends keyof VideoUpdatableOptions>(newOptionKey: T, newOptionValue: VideoUpdatableOptions[T]) => void,
    connectToMediaViewer: (newControllerAppID:string) => void
}

type BeatPadValue = {
    keycode: React.KeyboardEvent["key"] | null
    timeStamp: number,
    playbackRate: number,
    preservesPitch: boolean
}

type BeatPadMappingList = {
    [key:React.KeyboardEvent["key"]]: BeatPadValue
}

type BeatPadMapping ={
    toMap: number,
    list: BeatPadMappingList
}

type FormValues = {
    currentTime: number,
    playbackRate: number,
}

export function MediaController({app_running_id,startingValues, videoRef,canvasRef, updateVideoCustomOptions, connectToMediaViewer}:MediaControllerProps){
    const [currentOptions, setCurrentOptions] = useState<VideoUpdatableOptions>(startingValues)
    const [currentFormOptions, setCurrentFormOptions] = useState<FormValues>({currentTime:startingValues.currentTime, playbackRate: startingValues.playbackRate})
    
    const [beatPadValues, setBeatPadValues] = useState<BeatPadValue[]>([])

    const {contextMenuDispatch} = useContext(ContextMenuContext)
    const {runningAppsData} = useContext(RunningAppsContext)

    const [beatPadMappings, setBeatPadMappings] = useState<BeatPadMapping>({toMap: -1, list: {}})

    const hasFocus = runningAppsData[app_running_id].zIndex == 999


    useEffect(()=>{
        function keyDownHandler(event:KeyboardEvent){
            if (hasFocus){
                if (beatPadMappings.toMap == -1){
                    if (beatPadMappings.list[event.key]){
                        // console.log("value",beatPadMappings.list[event.key])
                        applyBeatPadValue(beatPadMappings.list[event.key])

                    }
                    else{
                        // console.log("key not assigned to pad")
                    }
                }
                else{
                    // console.log("to map", beatPadMappings.toMap)
                    
                    if (!beatPadMappings.list[event.key]){
                        beatPadValues[beatPadMappings.toMap].keycode = event.key
                        setBeatPadValues(beatPadValues)
            
                        beatPadMappings.list[event.key] = beatPadValues[beatPadMappings.toMap]
                        beatPadMappings.toMap = -1
                        setBeatPadMappings(beatPadMappings)
                    }
                }
            }
        }
    
        document.addEventListener("keydown", keyDownHandler)

        return () => document.removeEventListener("keydown", keyDownHandler)
    },[hasFocus, app_running_id, beatPadMappings])


    useEffect(()=>{
        connectToMediaViewer(app_running_id)

        return ()=>{
            connectToMediaViewer("")

        }
    },[app_running_id, connectToMediaViewer])

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

    function updateBeatPadValue(index: number, newBeatPadValue: BeatPadValue){
        const currentBeatPadValue = beatPadValues[index]

        //Second part isnt really needed
        if (currentBeatPadValue.keycode && currentBeatPadValue.keycode != newBeatPadValue.keycode){
            delete beatPadMappings.list[currentBeatPadValue.keycode]
        }

        if (newBeatPadValue.keycode){
            beatPadMappings.list[newBeatPadValue.keycode] = newBeatPadValue
        }

        beatPadValues[index] = newBeatPadValue
        setBeatPadValues(beatPadValues)
        setBeatPadMappings(beatPadMappings)
        
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
        <div className="media-controller">
            <div className="media-controller-section">
                Progress Bar
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
                Preserve Pitch
                <input type="checkbox" tabIndex={-1} checked={currentOptions.preservesPitch} onChange={()=>{changeValue("preservesPitch", Boolean(!currentOptions.preservesPitch))}} name="perservePitch" id="perservePitch" />
            </div>

            <div className="media-controller-section">
                Playback Rate
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
                    Grayscale
                    <input type="checkbox" tabIndex={-1} checked={currentOptions.grayscale} onChange={()=>{changeValue("grayscale", Boolean(!currentOptions.grayscale))}} name="grayscale" id="grayscale" />
                </div>
                <div className="media-controller-section">
                    Inverse
                    <input type="checkbox" tabIndex={-1} checked={currentOptions.inverseColour} onChange={()=>{changeValue("inverseColour", Boolean(!currentOptions.inverseColour))}} name="inverseColour" id="inverseColour" />
                </div>
            </div>

            <div className="media-controller-section">
                <div className="media-controller-section-titlebar">
                    Beat Pad
                    <div className="media-controller-section-titlebar-button common-border"
                        onClick={()=>{
                            beatPadValues.push()
                            setBeatPadValues([...beatPadValues, {
                                keycode: null,
                                timeStamp: currentOptions.currentTime,
                                playbackRate: currentOptions.playbackRate,
                                preservesPitch: currentOptions.preservesPitch
                            }])
                        }}
                    >
                        +
                    </div>
                </div>
                <div className="beat-pad-section">
                    {
                        beatPadValues.map((value, index)=>{
                            return(
                                <div className="beat-pad-section-value common-border" key={"beat-pad-value"+index}
                                    onClick={()=>{applyBeatPadValue(value)}}
                                    onContextMenu={(event)=>{
                                        contextMenuPropagation(event)
                                        contextMenuDispatch({
                                            type:"SET",
                                            event: event,
                                            newOptions:{
                                                "Delete pad": ()=>{
                                                    if (value.keycode){
                                                        delete beatPadMappings.list[value.keycode]
                                                        setBeatPadMappings(beatPadMappings)
                                                    }

                                                    beatPadValues.splice(index, 1)
                                                    setBeatPadValues(beatPadValues)
                                                },
                                                "Update pad with current": ()=>{
                                                    updateBeatPadValue(index, {
                                                        keycode: value.keycode,
                                                        timeStamp: currentOptions.currentTime,
                                                        playbackRate: currentOptions.playbackRate,
                                                        preservesPitch: currentOptions.preservesPitch
                                                    })
                                                    
                                                },
                                                "Update pad timestamp": ()=>{
                                                    updateBeatPadValue(index,{
                                                        ...value,
                                                        timeStamp: currentOptions.currentTime,
                                                    })
                                                },
                                                "Update pad playbackrate": ()=>{
                                                    updateBeatPadValue(index, {
                                                        ...value,
                                                        playbackRate: currentOptions.playbackRate,
                                                        
                                                    })
                                                },
                                                "Swap pad preserve pitch": ()=>{
                                                    updateBeatPadValue(index, {
                                                        ...value,
                                                        preservesPitch: !value.preservesPitch,
                                                        
                                                    })
                                                },
                                                "Set key value": ()=>{
                                                    if (value.keycode){
                                                        delete beatPadMappings.list[value.keycode]
                                                        value.keycode = null
                                                        beatPadValues[index] = value
                                                        setBeatPadValues(beatPadValues)
                                                    }
                                                    setBeatPadMappings({toMap: index, list: beatPadMappings.list})
                                                }
                                            }
                                        })
                                    }}
                                
                                >
                                    {index} <br/>
                                    {value.keycode != null ? <>{value.keycode} <br/></>: (
                                        beatPadMappings.toMap == index ? <>Press a key<br/></> : <>Unassigned<br/></>
                                    )}
                                    {value.preservesPitch ? <>True</> : <>False</>} <br/>
                                    {value.playbackRate} <br/>
                                    {value.timeStamp} <br/>
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

        </div>
    )


}