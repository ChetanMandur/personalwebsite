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
      <div className="desktop"
        id="desktop" 
        onMouseDown={()=>{
          if(contextMenuData.visible){
            contextMenuDispatch({type:"HIDE"})
          }
        }}
        onContextMenu={(event)=>{
          contextMenuPropagation(event);
          if(contextMenuData.visible){
            contextMenuDispatch({type:"HIDE"})
          }
        }}
      >
        <UserSpace/>
        <Taskbar/>
        {contextMenuData.visible ? 
          <ContextMenu/> 
          :
          <></>
        }
        {tooltipData.visible ? 
          // The random key makes it so that each time the mouse is moved, the tooltip goes away
          // If random key was not there, and the user moves within a tooltip summoning area, the tooltip would not disappear/reappear
          <Tooltip key={Math.random()}/> 
          :
          <></>
        }
      </div>  
  );
}