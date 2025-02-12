import { useContext, useEffect, useRef, useState } from "react"
import { AppRunningID, RunningAppsContext } from "../../Desktop/Contexts/RunningAppsContext"
import { MyFileSystemFile } from "../FileExplorer/MyFileSystem"
import "./MediaViewer.css"

export type MediaViewerProps = AppRunningID & {
    name: string,
    data: string,
    type: MyFileSystemFile["type"]
}


export function MediaViewer({data, type, app_running_id, name}:MediaViewerProps){
    const [currentData] = useState<string>(data ?? "")
    const [currentType] = useState<MyFileSystemFile["type"] | null>(type ?? null)
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

    function renderFrame(){
        if (videoRef.current != null && canvasRef.current != null){

            canvasRef.current?.getContext("2d")?.drawImage(videoRef.current, 0,0, canvasRef.current.width, canvasRef.current.height )
        }
    }


    function onPlayHandler(){
        if (!videoRef.current?.paused && !videoRef.current?.ended){
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
                        <canvas ref={canvasRef} />            
                        <video ref={videoRef} onPlay={()=>{onPlayHandler()}} src={currentData} hidden={true} autoPlay controls />

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