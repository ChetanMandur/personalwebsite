import "./Desktop.css";

import UserSpace from "./UserSpace/UserSpace";
import Taskbar from "./Taskbar/Taskbar";
import ContextMenu from "./ContextMenu/ContextMenu";
import { useContext } from "react";
import { ContextMenuContext } from "./Contexts/ContextMenuData";



export default function Desktop() {
  const {contextMenuData}=useContext(ContextMenuContext)
  return (
      <div className="main-container">
        <UserSpace/>
        <Taskbar/>
        {contextMenuData.visible ? <ContextMenu/> : <></>}
      </div>  
  );
}