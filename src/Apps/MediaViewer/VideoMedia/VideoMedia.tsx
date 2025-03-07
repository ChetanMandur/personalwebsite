import { createRef, useContext, useEffect, useState } from "react"
import { ContextMenuContext, ContextMenuOptions, contextMenuPropagation } from "../../../Desktop/Contexts/ContextMenuContext"
import { AppRunningID, RunningAppsContext } from "../../../Desktop/Contexts/RunningAppsContext"
import { MediaControllerProps } from "../../MediaController/MediaController"
import "./VideoMedia.css"


type VideoMediaProps = AppRunningID & {
    currentData: string

}


export type VideoCustomOptions = {
    playbackRate: number,
    preservesPitch: boolean,
    grayscale: boolean,
    inverseColour: boolean
}

type RefCollection = {
    videoRef: React.MutableRefObject<HTMLVideoElement | null>,
    canvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
    seekBarRef: React.MutableRefObject<HTMLDivElement | null>,
    animationID: React.MutableRefObject<number | null>,
}

type VideoProperties = {
    playing: boolean,
    videoFill: boolean
    seekBarProgressLength: number,
    seekBarClicked:boolean,
    refCollection: RefCollection,
    videoCustomOptions: VideoCustomOptions
}


export function VideoMedia ({app_running_id, currentData}:VideoMediaProps) {
    const defaultVideoProperties : VideoProperties = {
        playing: true,
        videoFill: true,
        seekBarProgressLength: 0,
        seekBarClicked: false,
        refCollection: {
            videoRef:createRef<HTMLVideoElement>(), 
            canvasRef:createRef<HTMLCanvasElement>(),
            seekBarRef: createRef<HTMLDivElement>(),
            animationID: createRef<number|null>()
        },
        videoCustomOptions: {
            playbackRate: 1,
            preservesPitch: true,
            grayscale: false,
            inverseColour: false,
        }
    }

    const [videoProperties, setVideoProperties] = useState<VideoProperties>(defaultVideoProperties)
    const [controllerAppRunningID, setControllerAppRunningID] = useState<string>("")

    const {contextMenuDispatch} = useContext(ContextMenuContext)
    const {runningAppsData,runningAppsDispatch} = useContext(RunningAppsContext)
    

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
        console.log("play/pause")
        if (videoProperties.refCollection.videoRef.current){
            if (videoProperties.playing){
                restartRender(false)
            }
            else{
                clearRender()
            }
        }
    },[videoProperties.playing])


    useEffect(()=>{
        if (!videoProperties.playing){
            startRender(true)
            // restartRender(true)
        } 
    },[videoProperties.seekBarProgressLength])


    useEffect(()=>{
        console.log("update custom options",videoProperties)
        restartRender(videoProperties.playing ? false : true)
    },[videoProperties.videoCustomOptions])


    function startRender(once:boolean){
        // console.log("startRender previous:", videoProperties.refCollection.animationID.current!)
        videoProperties.refCollection.animationID.current! = requestAnimationFrame(()=>{
            renderFrame(once)
        })
        // console.log("startRender new:", videoProperties.refCollection.animationID.current!)
    }

    function clearRender(){
        // console.log("clearRender", videoProperties.refCollection.animationID.current!, "\n     ")
        cancelAnimationFrame(videoProperties.refCollection.animationID.current!)
        videoProperties.refCollection.animationID.current! = 0
    }


    function restartRender(once:boolean){
        clearRender()
        startRender(once)
    }
    
    function renderFrame(once:boolean){
        // console.log("renderFrame:", videoProperties.playing, !videoProperties.refCollection.videoRef.current!.paused)
        // console.log("renderFrame:", videoProperties.refCollection.animationID.current!)
        if (videoProperties.refCollection.videoRef.current != null && videoProperties.refCollection.canvasRef.current != null){
           
            const videoContext = videoProperties.refCollection.canvasRef.current.getContext("2d")! 

            videoContext.drawImage(
                videoProperties.refCollection.videoRef.current, 
                0,
                0, 
                videoProperties.refCollection.canvasRef.current.width, 
                videoProperties.refCollection.canvasRef.current.height 
            )

            let videoFrame = videoContext.getImageData(
                0,
                0, 
                videoProperties.refCollection.canvasRef.current.width, 
                videoProperties.refCollection.canvasRef.current.height 
            );

            const totalPixels = videoFrame.data.length/4

            // console.log("RENDER FRAME", videoProperties.videoCustomOptions)
            for (let i = 0; i < totalPixels; i++) {
                const red = videoFrame.data[i*4]
                const green = videoFrame.data[i*4 + 1]
                const blue = videoFrame.data[i*4 + 2]
                // const alpha = videoFrame.data[i*4 + 3] commented out.... FOR NOW

                if (videoProperties.videoCustomOptions.grayscale){

                    const grey = (red + green + blue) /3;

                    videoFrame.data[i * 4 + 0] = grey;
                    videoFrame.data[i * 4 + 1] = grey;
                    videoFrame.data[i * 4 + 2] = grey;

                    // videoFrame.data[i * 4 + 0] = 255 - red;
                    // videoFrame.data[i * 4 + 1] = 255 - green;
                    // videoFrame.data[i * 4 + 2] = 255 - blue;
                }
            }
            videoProperties.refCollection.canvasRef.current.getContext("2d")!.putImageData(videoFrame, 0, 0);


            //rn this is just copy paste code, but ima make this a for-loop later 
            videoFrame = videoContext.getImageData(
                0,
                0, 
                videoProperties.refCollection.canvasRef.current.width, 
                videoProperties.refCollection.canvasRef.current.height 
            );


            for (let i = 0; i < totalPixels; i++) {
                const red = videoFrame.data[i*4]
                const green = videoFrame.data[i*4 + 1]
                const blue = videoFrame.data[i*4 + 2]
                // const alpha = videoFrame.data[i*4 + 3] commented out.... FOR NOW

                if (videoProperties.videoCustomOptions.inverseColour){

                    videoFrame.data[i * 4 + 0] = 255 - red;
                    videoFrame.data[i * 4 + 1] = 255 - green;
                    videoFrame.data[i * 4 + 2] = 255 - blue;
                }
            }
            videoProperties.refCollection.canvasRef.current.getContext("2d")!.putImageData(videoFrame, 0, 0);

            setVideoProperties(pendingProperties => (
                {
                    ...pendingProperties,
                    seekBarProgressLength: calculateSeekBarProgress()
                }
            ))   
            
            if (!once){
                // console.log("renderFrame LOOP")
                startRender(once)
            }
            else{
                // console.log("renderFrame ONCE")
                clearRender()
            }

        }
    }

    function calculateSeekBarProgress():number{
        if (videoProperties.refCollection.videoRef.current != null && !isNaN(videoProperties.refCollection.videoRef.current.duration) && videoProperties.refCollection.seekBarRef.current != null){
            return ((videoProperties.refCollection.videoRef.current.currentTime /(videoProperties.refCollection.videoRef.current.duration))  * (videoProperties.refCollection.seekBarRef.current.getBoundingClientRect().width))
        } else {return 0}
    }

    

    function updateVideoCustomOptions<T extends keyof VideoCustomOptions>(newOptionKey: T, newOptionValue: VideoCustomOptions[T]){
        switch (newOptionKey) {
            case "playbackRate":
                videoProperties.refCollection.videoRef.current!.playbackRate = newOptionValue as number
                break;
            case "preservesPitch":
                videoProperties.refCollection.videoRef.current!.preservesPitch = newOptionValue as boolean;
                break;
            default:
                break;
        }
        
        setVideoProperties((pendingState) =>{
            const newOptions:VideoCustomOptions = {...pendingState.videoCustomOptions, [newOptionKey]:newOptionValue}
            return {...pendingState, videoCustomOptions:newOptions}
        })

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
        const seekBarBoundingClientRect = videoProperties.refCollection.seekBarRef.current!.getBoundingClientRect()!
        const seekBarClickedRatio = (event.clientX - seekBarBoundingClientRect.x) / seekBarBoundingClientRect.width
        videoProperties.refCollection.videoRef.current!.currentTime = videoProperties.refCollection.videoRef.current!.duration * seekBarClickedRatio

        setVideoProperties(pendingProperties => ({...pendingProperties, seekBarProgressLength: calculateSeekBarProgress()}))

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
                            startingValues: videoProperties.videoCustomOptions,
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
        <div className="video-media" key={"video-media"+app_running_id}>
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
            <div className="video-overlay">
                <div className="bottom-bar">
                    <div className="playback-button"
                        onClick={(event)=>{
                            event.stopPropagation()
                            playPauseHandler()
                        }}
                    >
                        <img src={videoProperties.playing == false ? "https://www.svgrepo.com/show/486784/play.svg " : "https://www.svgrepo.com/show/506666/pause.svg"} alt="" />
                    </div> 
                    <div className="seek-bar"  ref={videoProperties.refCollection.seekBarRef}
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