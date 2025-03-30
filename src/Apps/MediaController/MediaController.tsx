import { useEffect, useState } from "react"
import { AppRunningID } from "../../Desktop/Contexts/RunningAppsContext"
import "./MediaController.css"
import { VideoUpdatableOptions } from "../MediaViewer/VideoMedia/VideoMedia"

export type MediaControllerProps = AppRunningID & {
    startingValues: VideoUpdatableOptions,
    videoRef: React.MutableRefObject<HTMLVideoElement | null>,
    canvasRef:React.MutableRefObject<HTMLCanvasElement | null>,
    updateVideoCustomOptions: <T extends keyof VideoUpdatableOptions>(newOptionKey: T, newOptionValue: VideoUpdatableOptions[T]) => void,
    connectToMediaViewer: (newControllerAppID:string) => void
}



export function MediaController({app_running_id,startingValues, videoRef,canvasRef, updateVideoCustomOptions, connectToMediaViewer}:MediaControllerProps){
    const [values, setValues] = useState<VideoUpdatableOptions>(startingValues)

    useEffect(()=>{
        connectToMediaViewer(app_running_id)

        return ()=>{
            connectToMediaViewer("")

        }
    },[app_running_id, connectToMediaViewer])

    useEffect(()=>{
        const intervalID = setInterval(()=>{setValues(pendingState=>({...pendingState, currentTime: videoRef.current!.currentTime, playing: !videoRef.current?.paused}))}, 0)

        return ()=>{
            clearInterval(intervalID)
        }

    },[])


    function changeValue<T extends keyof VideoUpdatableOptions>(newOptionKey: T, newOptionValue: VideoUpdatableOptions[T]){
        // console.log(newOptionKey, newOptionValue)
        setValues(pendingState =>({...pendingState, [newOptionKey]:newOptionValue}))
        updateVideoCustomOptions(newOptionKey, newOptionValue)
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
                    <div className="media-controller-section-progressbar-playpause-button common-border" onClick={()=>{changeValue("playing", Boolean(!values.playing))}}><img src={values.playing == false ? "https://www.svgrepo.com/show/486784/play.svg " : "https://www.svgrepo.com/show/506666/pause.svg"} alt="" /> </div>
                    <input type="range"  tabIndex={-1} value={values.currentTime} min={0} max={videoRef.current?.duration} step={0.000001} onChange={(event)=>{changeValue("currentTime", Number(event.target.value))}} name="currentTime" id="currentTime" />

                </div>
                {values.currentTime.toFixed(6)}
            </div>
            <div className="media-controller-section">
                Preserve Pitch
                <input type="checkbox" tabIndex={-1} checked={values.preservesPitch} onChange={()=>{changeValue("preservesPitch", Boolean(!values.preservesPitch))}} name="perservePitch" id="perservePitch" />
            </div>

            <div className="media-controller-section">
                Playback Rate
                <input type="range" tabIndex={-1} value={values.playbackRate} min={0} max={2} step={0.1} onChange={(event)=>{changeValue("playbackRate", Number(event.target.value))}} name="playbackRate" id="playbackRate" />
                {values.playbackRate}
            </div>
            <div className="media-controller-section-holder">
                <div className="media-controller-section">
                    Grayscale
                    <input type="checkbox" tabIndex={-1} checked={values.grayscale} onChange={()=>{changeValue("grayscale", Boolean(!values.grayscale))}} name="grayscale" id="grayscale" />
                </div>
                <div className="media-controller-section">
                    Inverse
                    <input type="checkbox" tabIndex={-1} checked={values.inverseColour} onChange={()=>{changeValue("inverseColour", Boolean(!values.inverseColour))}} name="inverseColour" id="inverseColour" />
                </div>
            </div>

            <div className="media-controller-section">
                <div className="color-swap-title">
                    Colour Swap
                    <div className="colour-swap-add common-border" onClick={()=>{
                        changeValue("colourSwapList", [...values.colourSwapList, {
                            from:{red:0, green:0, blue:0, alpha:0},
                            to:{red:0, green:0, blue:0, alpha:0},
                            range:0
                        }])
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

                        const seenSet = new Set<number>()

                        //Grab RGB value from canvas frame
                        //Check if RGB value is same as any 'to' value in colour swaps
                        // if RGB value is not the same (ie is a new value) we add it and swap it
                        // keep track of all pixels that have been picked, dont test pixels that already been tested

                        while (seenSet.size != totalPixels ){
                            //Grab random pixel
                            let randomPixel = (Math.floor(Math.random() * (frameData.length/4)))

                            //If random pixel has been checked, keep selecting new one until one hasnt been checked
                            while (randomPixel in seenSet){ 
                                randomPixel = (Math.floor(Math.random() * (frameData.length/4)))
                            }
                            
                            //Add pixel to seen set
                            seenSet.add(randomPixel)
                            
                            //Find RGB value of random pixel
                            const fromRed = frameData[randomPixel*4 + 0]
                            const fromGreen = frameData[randomPixel*4 + 1]
                            const fromBlue = frameData[randomPixel*4 + 2]

                            //Check if RGB value is the same as any 'to' value in the colour swap
                            // We do this so that we arent swapping values that are not from the original source
                            // ie. we don't want to create a chain of swap, where Source -> B and B -> C
                            //// I know this is expensive and I will probs fix this in the future.... maybe next commit... but maybe not
                            //// ^^^ Instead of creating a new set of 'unseen pixels' each time button is pressed
                            //// ^ In renderFrame() keep track of which pixels have been swapped (ie build seenSet in renderFrame())
                            //// ^ Keep picking a random pixel until a pixel that has not been swapped is grabbed
                            //// ^ Doing it this way, makes it so 1) dont need to rebuild seen pixel
                            //// ^ 2) recheck every new seen pixel with each and every colour swap value

                            let isUnique = true
                            for (const currentValue of values.colourSwapList){
                                if (currentValue.to.red == fromRed && currentValue.to.green == fromGreen && currentValue.to.blue == fromBlue){
                                    isUnique = false
                                    break;
                                    
                                }
                            }

                            if (isUnique){
                                const toRed = Math.floor(Math.random() * (256))
                                const toGreen = Math.floor(Math.random() * (256))
                                const toBlue = Math.floor(Math.random() * (256))
        
        
                                changeValue("colourSwapList", [...values.colourSwapList, {
                                    from:{red:fromRed, green:fromGreen, blue:fromBlue, alpha:0},
                                    to:{red:toRed, green:toGreen, blue:toBlue, alpha:0},
                                    range:Math.floor(Math.random() * (100))
                                }])
                                break
                            }
                        }

                        if (seenSet.size == totalPixels){
                            console.log("no pixels in current frame to randomize")
                        }
                    }}>Random</div>
                </div>
                <div className="color-swap-section">
                    {
                        values.colourSwapList.map(
                            (value, index)=>{
                                
                                return(
                                    <div className="colour-swap-section-value" key={"colour-swap-value"+index}>
                                        <div className="colour-swap-section-value-option">
                                            FROM:
                                            <input type="color" value={rgbToHex(value.from.red, value.from.green, value.from.blue)} name="from-color-swap" id="from-color-swap"
                                                
                                                onChange={(event)=>{
                                                    [value.from.red, value.from.green, value.from.blue] = hexToRGB(event.target.value)
                                                    values.colourSwapList[index] = value
                                                    changeValue("colourSwapList", values.colourSwapList)
                                                }}
                                            />
                                        </div>

                                        <div className="colour-swap-section-value-option">
                                            TO:
                                            <input type="color" value={rgbToHex(value.to.red, value.to.green, value.to.blue)} name="to-color-swap" id="to-color-swap"
                                                onChange={(event)=>{
                                                    [value.to.red, value.to.green, value.to.blue] = hexToRGB(event.target.value)
                                                    values.colourSwapList[index] = value
                                                    changeValue("colourSwapList", values.colourSwapList)
                                                }}
                                            />
                                        </div>
                                        
                                        <div className="colour-swap-section-value-option" >
                                            RANGE:
                                            <input type="number" placeholder="0" value={value.range || ''} min={0} max={255}
                                                onChange={(event)=>{
                                                    const targetValue = Number(event.target.value)
                                                    if (targetValue >= 0 && targetValue <= 255){
                                                        value.range = targetValue
                                                        values.colourSwapList[index] = value
                                                        changeValue("colourSwapList", values.colourSwapList)
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
                                            values.colourSwapList.splice(index, 1)
                                            changeValue("colourSwapList",
                                                [...values.colourSwapList]
                                            )
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