import {useContext, useEffect,  useState } from "react"
import { AppRunningID, RunningAppsContext } from "../../Desktop/Contexts/RunningAppsContext"
import { MyFileSystemFile } from "../FileExplorer/MyFileSystem"
import "./MediaViewer.css"
import { VideoMedia } from "./VideoMedia/VideoMedia"

export type MediaViewerProps = AppRunningID & {
    name: string,
    fileData: MyFileSystemFile
}



export function MediaViewer({fileData, app_running_id, name}:MediaViewerProps){
    
    const [currentData] = useState<string>(fileData.data ?? "")
    const [currentType] = useState<MyFileSystemFile["type"] | null>(fileData.type ?? null)

    const {runningAppsDispatch} = useContext(RunningAppsContext)
    
    
    useEffect(()=>{
        runningAppsDispatch({type:"UPDATE-APP-ADDITIONAL-TITLE", app_running_id:app_running_id,appAdditionalTitle: name })
    },[app_running_id,name, runningAppsDispatch])


    function MediaGenerator():JSX.Element{
        switch (currentType) {
            case "IMAGE":
                return <div className="image-container" style={{backgroundImage:`url(${currentData})`}}></div>

            
            case "VIDEO":
                return (
                    <VideoMedia currentData={currentData} app_running_id={app_running_id}/>
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