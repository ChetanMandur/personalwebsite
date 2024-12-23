import "./FileExplorer.css"

export type FileExplorerProps = {
    path: string
}

export default function FileExplorer({path}:FileExplorerProps){


    return(
    <div className="file-explorer">
        Hello, I am the file explorer. {path}
    </div>
    )
}