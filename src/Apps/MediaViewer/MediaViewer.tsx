import React, { createRef, useContext, useEffect,  useState } from "react"
import { AppRunningID, RunningAppsContext } from "../../Desktop/Contexts/RunningAppsContext"
import { MyFileSystemFile } from "../FileExplorer/MyFileSystem"
import "./MediaViewer.css"
import { ContextMenuContext, ContextMenuOptions, contextMenuPropagation } from "../../Desktop/Contexts/ContextMenuContext"
import { MediaControllerProps } from "../MediaController/MediaController"

export type MediaViewerProps = AppRunningID & {
    name: string,
    data: string,
    type: MyFileSystemFile["type"]
}

export type VideoCustomOptions = {
    playbackRate: number,
    preservesPitch: boolean
}

type RefCollection = {
    videoRef: React.MutableRefObject<HTMLVideoElement | null>,
    canvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
    seekBarRef: React.MutableRefObject<HTMLDivElement | null>,
}

type VideoProperties = {
    playing: boolean,
    seekBarProgressLength: number,
    seekBarClicked:boolean,
    refCollection: RefCollection,
    videoCustomOptions: VideoCustomOptions
}

const defaultVideoProperties : VideoProperties = {
    playing: true,
    seekBarProgressLength: 0,
    seekBarClicked: false,
    refCollection: {
        videoRef:createRef<HTMLVideoElement>(), 
        canvasRef:createRef<HTMLCanvasElement>(),
        seekBarRef: createRef<HTMLDivElement>(),
    },
    videoCustomOptions: {
        playbackRate: 1,
        preservesPitch: true
    }
}


export function MediaViewer({data, type, app_running_id, name}:MediaViewerProps){
    const [currentData] = useState<string>(data ?? "")
    const [currentType] = useState<MyFileSystemFile["type"] | null>(type ?? null)
    const [videoProperties, setVideoProperties] = useState<VideoProperties>(defaultVideoProperties)
    const {runningAppsDispatch} = useContext(RunningAppsContext)

    const {contextMenuDispatch} = useContext(ContextMenuContext)

    
    useEffect(()=>{
        runningAppsDispatch({type:"UPDATE-APP-ADDITIONAL-TITLE", app_running_id:app_running_id,appAdditionalTitle: name })
    },[app_running_id,name, runningAppsDispatch])
    

    function updateVideoCustomOptions(newOptions: VideoCustomOptions){
        videoProperties.refCollection.videoRef.current!.playbackRate = newOptions.playbackRate
        videoProperties.refCollection.videoRef.current!.preservesPitch = newOptions.preservesPitch
        setVideoProperties(pendingState =>({...pendingState, videoCustomOptions:newOptions}))
        

    }

    function renderFrame(){
        setVideoProperties(pendingState => ({...pendingState, seekBarProgressLength: calculateSeekBarProgress()}))
        if (videoProperties.refCollection.videoRef.current != null && videoProperties.refCollection.canvasRef.current != null){
            
            videoProperties.refCollection.canvasRef.current.getContext("2d")?.drawImage(
                videoProperties.refCollection.videoRef.current, 
                0,
                0, 
                videoProperties.refCollection.canvasRef.current.width, 
                videoProperties.refCollection.canvasRef.current.height 
            )
        }
    }


    function onPlayHandler(){
        if (!videoProperties.refCollection.videoRef.current?.paused && !videoProperties.refCollection.videoRef.current?.ended && videoProperties.refCollection.videoRef != null){
            renderFrame();
            setTimeout(()=>{onPlayHandler()},0)
        }
    }


    //this is probs so expensive but yolo <------ i wonder if memos or callbacks or something will make this better.... YOLO
    function onPauseHandler(){
        if ((videoProperties.refCollection.videoRef.current?.paused || videoProperties.refCollection.videoRef.current?.ended) && videoProperties.refCollection.videoRef != null){
            setVideoProperties(pendingState => ({...pendingState, seekBarProgressLength: calculateSeekBarProgress()}))
            setTimeout(()=>{onPauseHandler()},0)
        }

    }

    function calculateSeekBarProgress():number{
        if (videoProperties.refCollection.videoRef.current != null && !isNaN(videoProperties.refCollection.videoRef.current.duration) && videoProperties.refCollection.seekBarRef.current != null){
            return ((videoProperties.refCollection.videoRef.current.currentTime /(videoProperties.refCollection.videoRef.current.duration))  * (videoProperties.refCollection.seekBarRef.current.getBoundingClientRect().width))
        } else {return 0}
    }

    function playPauseHandler(){
        if(videoProperties.refCollection.videoRef.current?.paused){
            videoProperties.refCollection.videoRef.current.play()
        }else{
            videoProperties.refCollection.videoRef.current?.pause()
        }
    }

    function videoScrubbing(event: React.MouseEvent<HTMLDivElement, MouseEvent> | MouseEvent ){
        const seekBarBoundingClientRect = videoProperties.refCollection.seekBarRef.current!.getBoundingClientRect()!
        const seekBarClickedRatio = (event.clientX - seekBarBoundingClientRect.x) / seekBarBoundingClientRect.width
        videoProperties.refCollection.videoRef.current!.currentTime = videoProperties.refCollection.videoRef.current!.duration * seekBarClickedRatio

        if (!videoProperties.playing){
            const playPromise = videoProperties.refCollection.videoRef.current!.play()
            playPromise.then(
                ()=>{
                    videoProperties.refCollection.videoRef.current!.pause()
                }
            )
        }
    }

    function MediaGenerator():JSX.Element{
        switch (currentType) {
            case "IMAGE":
                return <div className="image-container" style={{backgroundImage:`url(${currentData})`}}></div>

            
            case "VIDEO":
                return (
                    <>
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
                                        newOptions:{
                                            "Open Controller": ()=>{
                                                runningAppsDispatch(
                                                    {
                                                        type:"ADD",
                                                        app_name: "MediaController",
                                                        props:{
                                                            startingValues: videoProperties.videoCustomOptions,
                                                            updateVideoCustomOptions: updateVideoCustomOptions
                                                        } as MediaControllerProps
    
                                                    }
                                                )
                                            }
                                        } as ContextMenuOptions
                                    }
                                )

                            }}
                            
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
                                <div className="seek-bar" ref={videoProperties.refCollection.seekBarRef}
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
                        onPlay={()=>{
                            onPlayHandler(); 
                            setVideoProperties((pendingState) =>{
                                return {
                                    ...pendingState,
                                    playing:true
                                }
                            })

                        }} 
                        onPause={()=>{
                            onPauseHandler()
                            setVideoProperties((pendingState) =>{
                                return {
                                    ...pendingState,
                                    playing: false
                                }
                            })
                        }} 
                        src={currentData} 
                        hidden={true} autoPlay controls />
                    </>
                )

            
            case "PDF":
                return <embed src={currentData} type="application/pdf" />

        }

        return <></>
    }


    return (
        <div className="media-viewer">
            {MediaGenerator()}
        </div>
    )
}