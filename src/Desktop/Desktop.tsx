import "./Desktop.css";

import UserSpace from "./UserSpace/UserSpace";
import Taskbar from "./Taskbar/Taskbar";
import ContextMenu from "./ContextMenu/ContextMenu";
import { useContext } from "react";
import { ContextMenuContext, contextMenuPropagation } from "./Contexts/ContextMenuData";



export default function Desktop() {
  const {contextMenuData, contextMenuDispatch}=useContext(ContextMenuContext)
  return (
      <div className="main-container" onContextMenu={(event)=>{contextMenuPropagation(event); if(contextMenuData.visible){contextMenuDispatch({type:"HIDE"})}}} onClick={()=>{ if(contextMenuData.visible){contextMenuDispatch({type:"HIDE"})}}}>
        <UserSpace/>
        <Taskbar/>
        {contextMenuData.visible ? <ContextMenu/> : <></>}
      </div>  
  );
}