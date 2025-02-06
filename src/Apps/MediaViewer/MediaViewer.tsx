import { useContext, useEffect, useState } from "react"
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
    
    
    useEffect(()=>{
        // console.log(app_running_id, name)
        runningAppsDispatch({type:"UPDATE-APP-ADDITIONAL-TITLE", app_running_id:app_running_id,appAdditionalTitle: name })
    },[])    

    function MediaGenerator():JSX.Element{
        switch (currentType) {
            case "IMAGE":
                return <div className="image-container" style={{backgroundImage:`url(${currentData})`}}></div>

            
            case "VIDEO":
                return <video src={currentData} autoPlay controls width={100}></video>

            
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