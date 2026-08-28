import { RunningAppsReducerAction } from "../../Desktop/Contexts/RunningAppsContext"
import { SystemAlertProps } from "./SystemAlert"

type DialogueMakerOptionsType = {
    [key:(number|string)]:SystemAlertProps
}

type DialogueMakerConstructorType = {
    dialogID: string,
    runningAppsDispatch: (value: RunningAppsReducerAction) => void,
    dialogueOptions: DialogueMakerOptionsType
}

export default class DialogueMaker {
    #dialogID: DialogueMakerConstructorType["dialogID"]
    #runningAppsDispatch: DialogueMakerConstructorType["runningAppsDispatch"]
    #dialogueOptions: DialogueMakerConstructorType["dialogueOptions"]
    
    constructor({dialogID, runningAppsDispatch, dialogueOptions}:DialogueMakerConstructorType){
        this.#dialogID = dialogID
        this.#runningAppsDispatch = runningAppsDispatch
        this.#dialogueOptions = dialogueOptions
    }

    get dialogID(){
        return this.#dialogID
    }

    #propsCreator(props:SystemAlertProps):SystemAlertProps{
        return {
            title: undefined,
            titleDetails: undefined,
            animatedMessage:undefined,
            soundEffect:undefined,
            skipSoundEffect:undefined,
            image: undefined,
            ...props
        }
    }

    start(){
        this.#runningAppsDispatch({
            type: "ADD",
            app_name: "SystemAlert",
            app_running_id: this.#dialogID,
            props: this.#propsCreator(this.#dialogueOptions[0])
        })
    }

    goTo(dialogOption:(number|string)){
        if (dialogOption in this.#dialogueOptions){
            this.#runningAppsDispatch({
                type: "UPDATE-APP-PROPS",
                app_running_id: this.#dialogID,
                props: this.#propsCreator(this.#dialogueOptions[dialogOption])
            })
        }
        else{
            this.#runningAppsDispatch({
                type:"ADD",
                app_running_id: this.#dialogID + "PathDoesntExistError",
                app_name: "SystemAlert",
                props: {
                    title: "Dialogue Error",
                    titleDetails: "Chetan so stupid",
                    message: "Dialogue path doesn't exist!\nIf you see this, that means Chetan messed up",
                    closeButton:{
                        display: true,
                        text: "Thanks a lot, Chetan"
                    }
                } as SystemAlertProps
            })
        }
        
    }

    update(props:Partial<SystemAlertProps>){
        this.#runningAppsDispatch({
            type: "UPDATE-APP-PROPS",
            app_running_id: this.#dialogID,
            props: props
        })
    }
}