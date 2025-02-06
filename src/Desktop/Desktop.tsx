import "./Desktop.css";

import UserSpace from "./UserSpace/UserSpace";
import Taskbar from "./Taskbar/Taskbar";
import ContextMenu from "./ContextMenu/ContextMenu";
import { useContext } from "react";
import { ContextMenuContext, contextMenuPropagation } from "./Contexts/ContextMenuContext";
import { TooltipContext } from "./Contexts/TooltipContext";
import Tooltip from "./Tooltip/Tooltip";



export default function Desktop() {
  const {contextMenuData, contextMenuDispatch}=useContext(ContextMenuContext)
  const {tooltipData} = useContext(TooltipContext)
  return (
      <div className="main-container" onContextMenu={(event)=>{contextMenuPropagation(event); if(contextMenuData.visible){contextMenuDispatch({type:"HIDE"})}}} onClick={()=>{ if(contextMenuData.visible){contextMenuDispatch({type:"HIDE"})}}}>
        <UserSpace/>
        <Taskbar/>
        {contextMenuData.visible ? 
          <ContextMenu/> 
          :
          <></>
        }
        {tooltipData.visible ? 
          <Tooltip key={Math.random()}/> 
          :
          <></>
        }
      </div>  
  );
}