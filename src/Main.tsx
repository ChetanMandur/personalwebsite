import "./Main.css";
import Desktop from "./Desktop/Desktop";
import { StateContext } from "./Desktop/Contexts/MainContext";





function Main() {
  return (
    <>
    <StateContext>
      <Desktop/>
    </StateContext>
    </>
  )
}

export default Main;
