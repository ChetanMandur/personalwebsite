import { useState } from "react"
import { AppRunningID } from "../../Desktop/Contexts/RunningApps"
import { MyFileSystemFile } from "../FileExplorer/MyFileSystem"
import "./MediaViewer.css"

export type MediaViewerProps = AppRunningID & {
    data: string,
    type: MyFileSystemFile["type"]
}


export function MediaViewer({data, type}:MediaViewerProps){
    const [currentData, setCurrentData] = useState<string>(data ?? "")
    const [currentType, setCurrentType] = useState<MyFileSystemFile["type"] | null>(type ?? null)


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