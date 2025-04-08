import React, { createRef, useContext, useEffect, useState } from "react"
import { ContextMenuContext, ContextMenuOptions, contextMenuPropagation } from "../../../Desktop/Contexts/ContextMenuContext"
import { AppRunningID, RunningAppsContext } from "../../../Desktop/Contexts/RunningAppsContext"
import { MediaControllerProps } from "../../MediaController/MediaController"
import "./VideoMedia.css"


type VideoMediaProps = AppRunningID & {
    currentData: string

}

type RGBAValue = {
    red: number ,
    green: number,
    blue: number,
    alpha: number
}

type ColourSwapValue = {
    from: RGBAValue,
    to: RGBAValue,
    range: number
}

type ColourSwapList = {
    values: ColourSwapValue[],
    changedPixels: React.MutableRefObject<Set<number> | null>
}

type VideoCustomOptions = {
    playbackRate: number,
    preservesPitch: boolean,
    grayscale: boolean,
    inverseColour: boolean
    colourSwapList: ColourSwapList
}

type RefCollection = {
    videoRef: React.MutableRefObject<HTMLVideoElement | null>,
    canvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
    seekBarRef: React.MutableRefObject<HTMLDivElement | null>,
    currentTimeUpdateRef: React.MutableRefObject<number | null>,
}

type VideoProperties = {
    playing: boolean,
    currentTime: number,
    videoFill: boolean
    seekBarProgressLength: number,
    seekBarClicked:boolean,
    refCollection: RefCollection,
    videoCustomOptions: VideoCustomOptions
}



export type VideoUpdatableOptions = VideoCustomOptions & {
    playing:boolean,
    currentTime: number
}

type OverlayProperties = {
    display: boolean,
    timeoutID: React.MutableRefObject<number | null>
}

export function VideoMedia ({app_running_id, currentData}:VideoMediaProps) {
    const defaultVideoProperties : VideoProperties = {
        playing: true,
        currentTime: 0,
        videoFill: true,
        seekBarProgressLength: 0,
        seekBarClicked: false,
        refCollection: {
            videoRef:createRef<HTMLVideoElement>(), 
            canvasRef:createRef<HTMLCanvasElement>(),
            seekBarRef: createRef<HTMLDivElement>(),
            currentTimeUpdateRef: createRef<number|null>()
        },
        videoCustomOptions: {
            playbackRate: 1,
            preservesPitch: true,
            grayscale: false,
            inverseColour: false,
            colourSwapList: {
                values: [],
                changedPixels: createRef<Set<number>>()
            }
        }
    }

    const [videoProperties, setVideoProperties] = useState<VideoProperties>(defaultVideoProperties)
    const [controllerAppRunningID, setControllerAppRunningID] = useState<string>("")

    const [showOverlay, setShowOverlay] = useState<OverlayProperties>({display:false, timeoutID: createRef<number|null>()})

    const {contextMenuDispatch} = useContext(ContextMenuContext)
    const {runningAppsData,runningAppsDispatch} = useContext(RunningAppsContext)

    useEffect(()=>{
        videoProperties.videoCustomOptions.colourSwapList.changedPixels.current = new Set<number>()
        return () =>{
                cancelAnimationFrame(videoProperties.refCollection.currentTimeUpdateRef.current!)
                // console.log("returning", videoProperties.refCollection.animationID.current!)
        }
    },[])

    useEffect(()=>{
        console.log("RESIZE")
        setVideoProperties(pendingProperties => (
            {
                ...pendingProperties,
                seekBarProgressLength: calculateSeekBarProgress()
            }
        ))

    }, [runningAppsData[app_running_id].height, runningAppsData[app_running_id].width, runningAppsData[app_running_id].maximizeType ])

    useEffect(()=>{
        return () => {
            if (controllerAppRunningID != ""){
                runningAppsDispatch({
                    type:"DELETE",
                    app_running_id: controllerAppRunningID
                })
            }
        }
    },[controllerAppRunningID, runningAppsDispatch])

    useEffect(()=>{
        // console.log("play/pause")

        const updateCurrentTimeLoop = () =>{
            // console.log("updating current time",videoProperties.refCollection.animationID.current )
            setVideoProperties(pendingState =>({...pendingState, currentTime: pendingState.refCollection.videoRef.current!.currentTime}))
            videoProperties.refCollection.currentTimeUpdateRef.current = requestAnimationFrame(updateCurrentTimeLoop)
        }

        if (videoProperties.refCollection.videoRef.current){
            if (videoProperties.playing){
                console.log("play")
                videoProperties.refCollection.videoRef.current.currentTime = videoProperties.currentTime
                videoProperties.refCollection.currentTimeUpdateRef.current = requestAnimationFrame(updateCurrentTimeLoop)

            }
            else{
                console.log("pause")
                cancelAnimationFrame(videoProperties.refCollection.currentTimeUpdateRef.current!)
                videoProperties.refCollection.currentTimeUpdateRef.current = null
            }
        }

        
        
    },[videoProperties.playing])

    useEffect(()=>{
        // console.log("currentTime updated",videoProperties.currentTime)
        requestAnimationFrame(renderFrame)
        setVideoProperties(pendingProperties => ({...pendingProperties, seekBarProgressLength: calculateSeekBarProgress()}))
    },[videoProperties.currentTime])

    useEffect(()=>{
        // console.log("update custom options",videoProperties)
        if (!videoProperties.playing){
            requestAnimationFrame(renderFrame)
        }
    },[videoProperties.videoCustomOptions])

    function renderFrame(){
        // console.log("renderFrame")
        //Check if videoRef and canvasRef are available
        if (videoProperties.refCollection.videoRef.current != null && videoProperties.refCollection.canvasRef.current != null && videoProperties.videoCustomOptions.colourSwapList.changedPixels.current != null ){
            videoProperties.videoCustomOptions.colourSwapList.changedPixels.current.clear()

            
            //Store context for canvas 
            const canvasContext = videoProperties.refCollection.canvasRef.current.getContext("2d")! 

            // Paint canvas with frame from video player
            canvasContext.drawImage(
                videoProperties.refCollection.videoRef.current, 
                0,
                0, 
                videoProperties.refCollection.canvasRef.current.width, 
                videoProperties.refCollection.canvasRef.current.height 
            )

            // Grab frame information from canvas
            const videoFrame = canvasContext.getImageData(
                0,
                0,
                videoProperties.refCollection.canvasRef.current.width, 
                videoProperties.refCollection.canvasRef.current.height
            )

            // Determine the amount of pixels in the frame
            // In videoFrame.data, it stores pixel data from top left -> bottom right in an array
            // Each index in the array is either a R,G,B, or A value
            // The data is supposed to be viewed in groups of 4, so that neighbouring indexes represent the same pixel
            // So, by dividing the length of the data by 4, we can count the total pixels in the frame
            const totalPixels = videoFrame.data.length/4

            // For each pixel, perform visual changes
            for (let currentPixel=0; currentPixel< totalPixels; currentPixel++){
                const currentPixelGroup = currentPixel*4

                //First element in group is red, then green, blue, and finally alpha
                let red = videoFrame.data[currentPixelGroup + 0]
                let green = videoFrame.data[currentPixelGroup + 1]
                let blue = videoFrame.data[currentPixelGroup + 2]
                // let alpha = videoFrame.data[i*4 + 3] commented out.... FOR NOW


                for (const colourSwap of videoProperties.videoCustomOptions.colourSwapList.values){
                    const redDiff = Math.abs(colourSwap.from.red - red)
                    const greenDiff = Math.abs(colourSwap.from.green - green)
                    const blueDiff = Math.abs(colourSwap.from.blue - blue)

                    const redCheck = redDiff >=0 && redDiff <= colourSwap.range
                    const greenCheck = greenDiff >=0 && greenDiff <= colourSwap.range
                    const blueCheck = blueDiff >=0 && blueDiff <= colourSwap.range

                    if (redCheck && greenCheck && blueCheck){
                        videoProperties.videoCustomOptions.colourSwapList.changedPixels.current.add(currentPixel)
                        red = colourSwap.to.red
                        green = colourSwap.to.green
                        blue = colourSwap.to.blue
                    }
   
                }

                //Applies grayscale transformation
                if (videoProperties.videoCustomOptions.grayscale){
                    const grey = (red + green + blue) /3;
                    red = green = blue = grey;

                }

                //Applies inverse colour transformation
                if (videoProperties.videoCustomOptions.inverseColour){
                    red = 255 - red;
                    green = 255 - green;
                    blue = 255 - blue;
                }

                //Apply transformed pixel values to frame
                videoFrame.data[currentPixelGroup + 0] = red;
                videoFrame.data[currentPixelGroup + 1] = green;
                videoFrame.data[currentPixelGroup + 2] = blue;
            }

            //Apply transformed video frame to canvas
            canvasContext.putImageData(videoFrame, 0, 0);
            // console.log("renderFrame",videoProperties.videoCustomOptions.colourSwapList.changedPixels.current)
        }
    }

    function calculateSeekBarProgress():number{
        if (videoProperties.refCollection.videoRef.current != null && !isNaN(videoProperties.refCollection.videoRef.current.duration) && videoProperties.refCollection.seekBarRef.current != null){
            return ((videoProperties.refCollection.videoRef.current.currentTime /(videoProperties.refCollection.videoRef.current.duration))  * (videoProperties.refCollection.seekBarRef.current.getBoundingClientRect().width))
        } else {return 0}
    }

    

    function updateVideoCustomOptions<T extends keyof VideoUpdatableOptions>(newOptionKey: T, newOptionValue: VideoUpdatableOptions[T]){
        switch (newOptionKey) {
            case "playbackRate":
                videoProperties.refCollection.videoRef.current!.playbackRate = newOptionValue as number
                break;
            case "preservesPitch":
                videoProperties.refCollection.videoRef.current!.preservesPitch = newOptionValue as boolean;
                break;
            case "currentTime":
                setVideoProperties((pendingState) =>{
                    return {...pendingState, currentTime: newOptionValue as number}
                })
                videoProperties.refCollection.videoRef.current!.currentTime = newOptionValue as number;

                break;
            
            case "playing":
                //playing == True
                if (newOptionValue){
                    videoProperties.refCollection.videoRef.current?.play()

                } else{
                    videoProperties.refCollection.videoRef.current?.pause()
                }
                break;

            default:
                break;
        }
        
       if (newOptionKey != "currentTime" || newOptionKey != "playing"){
            setVideoProperties((pendingState) =>{
                const newOptions:VideoCustomOptions = {...pendingState.videoCustomOptions, [newOptionKey]:newOptionValue}
                return {...pendingState, videoCustomOptions:newOptions}
            })
       }

    }

    function connectToMediaViewer(newControllerAppID: string){
        setControllerAppRunningID(newControllerAppID)
    }

    function playPauseHandler(){
        if (videoProperties.refCollection.videoRef.current){
            if (videoProperties.refCollection.videoRef.current.paused){
                videoProperties.refCollection.videoRef.current.play()
            }
            else{
                videoProperties.refCollection.videoRef.current.pause()
            }
        }
    }

    function videoScrubbing(event: React.MouseEvent<HTMLDivElement, MouseEvent> | MouseEvent ){
        const seekBarBoundingClientRect:DOMRect = videoProperties.refCollection.seekBarRef.current!.getBoundingClientRect()!
        const seekBarClickedRatio:number = (event.clientX - seekBarBoundingClientRect.x) / seekBarBoundingClientRect.width
        const newTime:number = videoProperties.refCollection.videoRef.current!.duration * seekBarClickedRatio
        videoProperties.refCollection.videoRef.current!.currentTime = newTime
        setVideoProperties(pendingProperties => ({...pendingProperties, currentTime: newTime}))

    }

    function generateContextMenu() : ContextMenuOptions{
        const output: ContextMenuOptions = {}
        
        if(videoProperties.videoFill){
            output["Fit Video Into View"] = ()=>{
                setVideoProperties(pendingState => ({
                    ...pendingState, videoFill:false
                }) )
            }
            
        } else{
            output["Fill Video Into View"] = ()=>{
                setVideoProperties(pendingState => ({
                    ...pendingState, videoFill:true
                }) )
            }
        }

        if (controllerAppRunningID == ""){
            output["Open Controller"] = ()=>{
                runningAppsDispatch(
                    {
                        type:"ADD",
                        app_name: "MediaController",
                        props:{
                            startingValues: {...videoProperties.videoCustomOptions,playing:videoProperties.playing, currentTime:videoProperties.currentTime},
                            videoRef: videoProperties.refCollection.videoRef,
                            canvasRef: videoProperties.refCollection.canvasRef,
                            updateVideoCustomOptions: updateVideoCustomOptions,
                            connectToMediaViewer: connectToMediaViewer
                        } as MediaControllerProps
                    }
                )
            }
        } else{
            output["Focus Controller"] = ()=>{
                runningAppsDispatch(
                    {
                        type:"UPDATE-APP-FOCUS",
                        app_running_id: controllerAppRunningID
                        
                    }
                )
            }
            output["Close Controller"] = ()=>{
                runningAppsDispatch(
                    {
                        type:"DELETE",
                        app_running_id: controllerAppRunningID
                    }
                )
            }
        }
        return output
    }
    return (
        <div className="video-media" key={"video-media"+app_running_id}
            onMouseMove={()=>{
                if (showOverlay.timeoutID.current){
                    clearTimeout(showOverlay.timeoutID.current)
                }
                setShowOverlay({...showOverlay, display:true})
                showOverlay.timeoutID.current = setTimeout(()=>{setShowOverlay({...showOverlay, display:false})}, 3000)
            }}
        >
            <canvas ref={videoProperties.refCollection.canvasRef} 
                onDoubleClick={(event)=>{
                    event.stopPropagation();
                    runningAppsDispatch({type:"MAXIMIZE",maximizeType:"FULL", app_running_id:app_running_id})
                }} 
                onClick={(event)=>{
                    event.stopPropagation();
                    playPauseHandler()
                }}
                onContextMenu={(event)=>{
                    contextMenuPropagation(event);
                    contextMenuDispatch(
                        {
                            type:"SET",
                            event:event,
                            newOptions: generateContextMenu()
                        }
                    )

                }}
                style={{objectFit:(videoProperties.videoFill ? "fill" : "contain")}}
                
            />            
            <div className={"video-overlay "+((showOverlay.display || videoProperties.seekBarClicked) ? "show-overlay" : "hide-overlay")}>
                <div className="bottom-bar">
                    <div className="playback-button common-border"
                        onClick={(event)=>{
                            event.stopPropagation()
                            playPauseHandler()
                        }}
                    >
                        <img src={videoProperties.playing == false ? "https://www.svgrepo.com/show/486784/play.svg " : "https://www.svgrepo.com/show/506666/pause.svg"} alt="" />
                    </div> 
                    <div className="seek-bar common-border"  ref={videoProperties.refCollection.seekBarRef}
                        onMouseDown={(event)=>{
                            setVideoProperties(pendingState => ({...pendingState, seekBarClicked: true}))
                            videoScrubbing(event)
                            document.addEventListener("mouseup", ()=>{
                                setVideoProperties(pendingState => ({...pendingState, seekBarClicked: false}));
                                document.removeEventListener("mousemove", videoScrubbing)
                            }, {once:true})
                            document.addEventListener("mousemove", videoScrubbing)
                        }}
                    >
                        <div className="seek-bar-progress" style={{width:videoProperties.seekBarProgressLength}}> 
                        </div>
                    </div>
                </div>
            </div>
            <video ref={videoProperties.refCollection.videoRef} 
            src={currentData} 
            crossOrigin="anonymous"
            onPlay={()=>{
                setVideoProperties(pendingProperties =>({
                    ...pendingProperties,
                    playing: true
                }))
            }}

            onPause={()=>{
                setVideoProperties(pendingProperties =>({
                    ...pendingProperties,
                    playing: false
                }))
            }}
            hidden={true} autoPlay controls />
        </div>
    )
}