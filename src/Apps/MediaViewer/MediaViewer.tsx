import React, { createRef, useContext, useEffect,  useState } from "react"
import { AppRunningID, RunningAppsContext } from "../../Desktop/Contexts/RunningAppsContext"
import { MyFileSystemFile } from "../FileExplorer/MyFileSystem"
import "./MediaViewer.css"

export type MediaViewerProps = AppRunningID & {
    name: string,
    data: string,
    type: MyFileSystemFile["type"]
}

type VideoProperties = {
    playing: boolean,
    seekBarProgressLength: number,
    videoRef: React.MutableRefObject<HTMLVideoElement | null>,
    canvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
    seekBarRef: React.MutableRefObject<HTMLDivElement | null>,
}


export function MediaViewer({data, type, app_running_id, name}:MediaViewerProps){
    const [currentData] = useState<string>(data ?? "")
    const [currentType] = useState<MyFileSystemFile["type"] | null>(type ?? null)
    const [currentVideoProperties, setCurrentVideoProperties] = useState<VideoProperties>({playing:true, seekBarProgressLength:0,videoRef:createRef<HTMLVideoElement>(), canvasRef:createRef<HTMLCanvasElement>() ,seekBarRef: createRef<HTMLDivElement>()})
    const {runningAppsDispatch} = useContext(RunningAppsContext)

    
    useEffect(()=>{
        runningAppsDispatch({type:"UPDATE-APP-ADDITIONAL-TITLE", app_running_id:app_running_id,appAdditionalTitle: name })
    },[app_running_id,name, runningAppsDispatch])
    


    function renderFrame(){
        setCurrentVideoProperties(pendingState => ({...pendingState, seekBarProgressLength: calculateSeekBarProgress()}))
        if (currentVideoProperties.videoRef.current != null && currentVideoProperties.canvasRef.current != null){
            currentVideoProperties.canvasRef.current?.getContext("2d")?.drawImage(currentVideoProperties.videoRef.current, 0,0, currentVideoProperties.canvasRef.current.width, currentVideoProperties.canvasRef.current.height )
        }
    }


    function onPlayHandler(){
        if (!currentVideoProperties.videoRef.current?.paused && !currentVideoProperties.videoRef.current?.ended && currentVideoProperties.videoRef != null){
            renderFrame();
            setTimeout(()=>{onPlayHandler()},0)
        }
    }


    //this is probs so expensive but yolo <------ i wonder if memos or callbacks or something will make this better.... YOLO
    function onPauseHandler(){
        if ((currentVideoProperties.videoRef.current?.paused || currentVideoProperties.videoRef.current?.ended) && currentVideoProperties.videoRef != null){
            setCurrentVideoProperties(pendingState => ({...pendingState, seekBarProgressLength: calculateSeekBarProgress()}))
            setTimeout(()=>{onPauseHandler()},0)
        }

    }

    function calculateSeekBarProgress():number{
        if (currentVideoProperties.videoRef.current != null && !isNaN(currentVideoProperties.videoRef.current.duration) && currentVideoProperties.seekBarRef.current != null){
            return ((currentVideoProperties.videoRef.current.currentTime /(currentVideoProperties.videoRef.current.duration))  * (currentVideoProperties.seekBarRef.current.getBoundingClientRect().width))
        } else {return 0}
    }

    function playPauseHandler(){
        if(currentVideoProperties.videoRef.current?.paused){
            currentVideoProperties.videoRef.current.play()
        }else{
            currentVideoProperties.videoRef.current?.pause()
        }
    }

    function MediaGenerator():JSX.Element{
        switch (currentType) {
            case "IMAGE":
                return <div className="image-container" style={{backgroundImage:`url(${currentData})`}}></div>

            
            case "VIDEO":
                return (
                    <>
                        <canvas ref={currentVideoProperties.canvasRef} onDoubleClick={(event)=>{event.stopPropagation();runningAppsDispatch({type:"MAXIMIZE",maximizeType:"FULL", app_running_id:app_running_id})}} onClick={(event)=>{event.stopPropagation();playPauseHandler()}} />            
                        <div className="video-overlay">
                            <div className="bottom-bar">
                                <div className="playback-button"
                                    onClick={(event)=>{
                                        event.stopPropagation()
                                        playPauseHandler()
                                    }}
                                >
                                    <img src={currentVideoProperties.playing == false ? "https://www.svgrepo.com/show/486784/play.svg " : "https://www.svgrepo.com/show/506666/pause.svg"} alt="" />
                                </div> 
                                <div className="seek-bar" ref={currentVideoProperties.seekBarRef}
                                    onMouseDown={(event)=>{
                                        event.stopPropagation()
                                        const seekBarBoundingClientRect = currentVideoProperties.seekBarRef.current!.getBoundingClientRect()!
                                        const seekBarClickedRatio = (event.clientX - seekBarBoundingClientRect.x) / seekBarBoundingClientRect.width
                                        currentVideoProperties.videoRef.current!.currentTime = currentVideoProperties.videoRef.current!.duration * seekBarClickedRatio

                                        if (!currentVideoProperties.playing){
                                            const playPromise = currentVideoProperties.videoRef.current!.play()
                                            playPromise.then(
                                                ()=>{
                                                    currentVideoProperties.videoRef.current!.pause()
                                                }
                                            )
                                        }
                                    }}
                                >
                                    <div className="seek-bar-progress" style={{width:currentVideoProperties.seekBarProgressLength}}> 
                                    </div>
                                </div>
                            </div>
                        </div>
                        <video ref={currentVideoProperties.videoRef} 
                        onPlay={()=>{
                            onPlayHandler(); 
                            setCurrentVideoProperties((pendingState) =>{
                                return {
                                    ...pendingState,
                                    playing:true
                                }
                            })

                        }} 
                        onPause={()=>{
                            onPauseHandler()
                            setCurrentVideoProperties((pendingState) =>{
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