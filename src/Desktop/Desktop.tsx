import "./Desktop.css";

import UserSpace from "./UserSpace/UserSpace";
import Taskbar from "./Taskbar/Taskbar";
import { StateContext } from "./Contexts/StateContext";



export default function Desktop() {

  return (
    <StateContext>
        <div className="main-container">
          <UserSpace/>
          <Taskbar/>
        </div>  
    </StateContext>
    
  );
}