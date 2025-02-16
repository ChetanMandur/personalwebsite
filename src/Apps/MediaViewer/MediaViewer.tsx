import React, { createRef, useContext, useEffect, useRef, useState } from "react"
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
    currentTime: number,
    progressRatio: number,
    seekBarRef: React.MutableRefObject<HTMLDivElement | null>
}


export function MediaViewer({data, type, app_running_id, name}:MediaViewerProps){
    const [currentData] = useState<string>(data ?? "")
    const [currentType] = useState<MyFileSystemFile["type"] | null>(type ?? null)
    const [currentVideoProperties, setCurrentVideoProperties] = useState<VideoProperties>({playing:true, currentTime:0, progressRatio:0, seekBarRef: createRef<HTMLDivElement>()})
    const {runningAppsDispatch} = useContext(RunningAppsContext)

    const videoRef = useRef<HTMLVideoElement|null>(null)
    const canvasRef = useRef<HTMLCanvasElement|null>(null)    
    
    useEffect(()=>{
        // console.log(app_running_id, name)
        runningAppsDispatch({type:"UPDATE-APP-ADDITIONAL-TITLE", app_running_id:app_running_id,appAdditionalTitle: name })
    },[app_running_id,name, runningAppsDispatch])

    // useLayoutEffect(()=>{
    //     if (type == "VIDEO"){
    //         // canvasRef.current?.getContext("2d")
    //         // videoRef.current!.play()
    //     }

    // },[type])

    // useEffect(()=>{
    //     if (currentVideoProperties.playing){
    //         console.log(currentVideoProperties)

    //     }

    // }, [currentVideoProperties])

    function renderFrame(){
        if (videoRef.current != null && canvasRef.current != null){
            setCurrentVideoProperties(pendingState => ({...pendingState, 
                currentTime: videoRef.current?.currentTime ?? 0, 
                progressRatio: ((videoRef.current?.currentTime ?? 0) / (videoRef.current?.duration ?? 1) * pendingState.seekBarRef.current!.getBoundingClientRect().width)}
            ))
            canvasRef.current?.getContext("2d")?.drawImage(videoRef.current, 0,0, canvasRef.current.width, canvasRef.current.height )
        }
    }


    function onPlayHandler(){
        if (!videoRef.current?.paused && !videoRef.current?.ended && videoRef != null){
            renderFrame();
            setTimeout(()=>{onPlayHandler()},0)
        } 
        
    }

    function MediaGenerator():JSX.Element{
        switch (currentType) {
            case "IMAGE":
                return <div className="image-container" style={{backgroundImage:`url(${currentData})`}}></div>

            
            case "VIDEO":
                return (
                    <>
                        <canvas ref={canvasRef} onDoubleClick={(event)=>{event.stopPropagation();runningAppsDispatch({type:"MAXIMIZE",maximizeType:"FULL", app_running_id:app_running_id})}} onClick={(event)=>{event.stopPropagation();if(videoRef.current?.paused){videoRef.current.play()}else{videoRef.current?.pause()}}} />            
                        <div className="video-overlay">
                            <div className="bottom-bar">
                                <div className="playback-button">
                                    <img src={currentVideoProperties.playing == false ? "https://www.svgrepo.com/show/486784/play.svg " : "https://www.svgrepo.com/show/506666/pause.svg"} alt="" />
                                </div> 
                                <div className="seek-bar" ref={currentVideoProperties.seekBarRef}>
                                    <div className="seek-bar-progress" style={{width:(currentVideoProperties.progressRatio)}}> 
                                    </div>
                                </div>
                            </div>
                        </div>
                        <video ref={videoRef} 
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