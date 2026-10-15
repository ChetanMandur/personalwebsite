import { RunningAppsReducerAction } from "../../Desktop/Contexts/RunningAppsContext"
import { SystemAlertProps } from "./SystemAlert"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { HelloWorldDialogueInitalizer } from "../HelloWorld/Dialogue" // Using this for JSDoc only

/** Typing that describes a list of `'paths'` used within the dialogue  
 * A `'path'` is simply an object representing a `SystemAlertProps` type  
 * The goal is to intraconnect (or is it inter-?) all the `'paths'` together, through each of their `SystemAlertProps.options` property  
 * 
 * Since one path can display a proper `SystemAlert`, the goal is it swap a single instance (of a `SystemAlert` component) props to different paths  
 * This allows for the ability of having dialogue trees, and in turn, `'paths'`  
 * 
 * Path `0` is required as it is the root/main path that is used. Without it, `DialogueMaker` won't know which path to start on and will fail
*/
type DialogueMakerPathsType = {
    /** REQUIRED: The main/root path */
    0: SystemAlertProps,
    /** OPTIONAL: Additional paths */
    [key:(number|string)]:SystemAlertProps
}

/** Required data inorder to create a `DialogueMaker` class */
type DialogueMakerConstructorType = {
    /** The `running_app_id` to be used by accompanying `SystemAlert` component */
    dialogueID: string,

    /** Access to the context/reducer (and since this isn't a component/hook, needs to get it fed from one) */
    runningAppsDispatch: (value: RunningAppsReducerAction) => void,

    /** A list of `paths` available within the dialogue tree  
     * Since a dialogue tree is a branching map of dialogue options, each 'branch' (ie. `path`) needs to be defined
    */
    dialoguePaths: DialogueMakerPathsType
}

/**
 * Used for creating dialogue trees using the `SystemAlert` component  
 * By feeding it an object/list of paths, you are able to create and start a `SystemAlert`  
 * The list of paths (`dialoguePaths`) is just an object where the keys are alphanumeric and the value represents a `SystemAlertProps`
 *  - With this format, the `key` can be viewed as the path/road being taken, while the `value` is simply the data being fed/displayed in the accompanying `SystemAlert` component  
 * Once an instance is made, the dialogue tree will not automatically start. To start it, must call its `.start()` function to launch a `SystemAlert` app with the tree
 * @see {@link HelloWorldDialogueInitalizer} for an example usage
 * @example
 * const dialogue = new DialogueMaker({
 *      dialogueID, 
 *      runningAppsDispatch, // Fed from a component/hook 
 *      dialoguePaths: {
 *          0: {
 *              animatedMessage:[
 *                  {message:"Welcome to the example dialogue tree!", speed:50}
 *              ],
 *              skipAnimationData:{enabled: false},
 *              closeButton: {display: true, text: "Get me out of here!"},
 *              options:{
 *                  "Thank you!": ()=>{dialogue.goTo(1)},
 *                  "Shut up!": ()=>{dialogue.goTo("1b")}
 *              }
 *          },
 *          1: {
 *              message: "You're very welcome! Hope you enjoyed your time!",
 *              closeButton: {display: true},
 *              options: {}
 *          },
 *          "1b": {
 *              message: "Ok, rude",
 *              closeButton: {display: true},
 *              options: {}
 *          }
 *      }
 * })
*/
export default class DialogueMaker {
    // Private data used to represent the instance

    /** The `running_app_id` to be used by accompanying `SystemAlert` component */
    #dialogueID: DialogueMakerConstructorType["dialogueID"]

    /** Access to the context/reducer (and since this isn't a component/hook, needs to get it fed from one) */
    #runningAppsDispatch: DialogueMakerConstructorType["runningAppsDispatch"]

    /** A list of `paths` available within the dialogue tree  
     * Since a dialogue tree is a branching map of dialogue options, each 'branch' (ie. `path`) needs to be defined
    */
    #dialoguePaths: DialogueMakerConstructorType["dialoguePaths"]
    
    constructor({dialogueID, runningAppsDispatch, dialoguePaths}:DialogueMakerConstructorType){
        this.#dialogueID = dialogueID
        this.#runningAppsDispatch = runningAppsDispatch
        this.#dialoguePaths = dialoguePaths
    }

    /**
     * Getter function to obtain the dialog ID (aka the `running_app_id`) for the current `DialogueMaker` 
    */
    get dialogueID(){
        return this.#dialogueID
    }

    /**
     * Helper function to quickly generate a usable `SystemAlertProps` prop based upon the given prop values 
     * @param props - Prop values to be used within the new generated props
     * @returns {SystemAlertProps} A complete `SystemAlertProps` that can be fed into a `SystemAlert` component 
    */
    #propsCreator(props:SystemAlertProps):SystemAlertProps{
        // All optional props become undefined, ie their default state
            // If they do have a value in the incoming props, this will be applied with the spreader at the bottom of the object
        return {
            title: undefined,
            titleDetails: undefined,
            animatedMessage:undefined,
            soundEffect:undefined,
            image: undefined,
            ...props
        }
    }

    /**
     * Used to launch the `SystemAlert` app along with the root of the dialogue tree  
     * If this is not ran, then the dialogue tree will not display
    */
    start(){
        this.#runningAppsDispatch({
            type: "ADD",
            app_name: "SystemAlert",
            app_running_id: this.#dialogueID,
            props: this.#propsCreator(this.#dialoguePaths[0])
        })
    }

    /**
     * Helper function, to be used within `dialoguePaths` to inter-connect paths to one another  
     * @param dialoguePath - The branch/path to be traversed to
     * @example
     * const dialogue = new DialogueMaker({
     *      dialogueID, runningAppsDispatch, // Pretend these are defined
     *      dialoguePaths: {
     *          0: {
     *              options:{
     *                  "Go to path 1": ()=>{dialogue.goTo(1)}
     *              },
     *              ... // Pretend other mandataory `SystemAlertProps` are defined
     *          }
     *      }
     * })
     * 
    */
    goTo(dialoguePath:(number|string)){
        // Checks if the path exists within the list of paths
        if (dialoguePath in this.#dialoguePaths){
            this.#runningAppsDispatch({
                type: "UPDATE-APP-PROPS",
                app_running_id: this.#dialogueID,
                props: this.#propsCreator(this.#dialoguePaths[dialoguePath])
            })
        }
        // If the path doesn't exist, display a generic error
        else{
            this.#runningAppsDispatch({
                type:"ADD",
                app_running_id: this.#dialogueID + "PathDoesntExistError",
                app_name: "SystemAlert",
                props: {
                    title: "Dialogue Error",
                    titleDetails: "Chetan so stupid",
                    message: "Dialogue path doesn't exist!\nIf you see this, that means Chetan messed up",
                    closeButton:{
                        enabled: true,
                        text: "Thanks a lot, Chetan"
                    }
                } as SystemAlertProps
            })
        }
        
    }

    /**
     * Helper function, to be used within `dialoguePaths` to update `SystemAlertProps` in states where a path traversal is not done (eg. pre, intra, and post functions)    
     * @param props - The specific props(s) being updated
     * @example
     * const dialogue = new DialogueMaker({
     *     dialogueID:"tete", runningAppsDispatch:()=>{}, // Pretend these are defined
     *     dialoguePaths: {
     *         0:{
     *             animatedMessage:[
     *                 {
     *                     message: "hii",
     *                     speed:50,
     *                     preFunction: ()=>{
     *                         dialogue.update({soundEffect: SystemSounds.Special.VineBoom})
     *                     }
     *                 }
     *             ]
     *         }
     *     }
     * })
     */
    update(props:Partial<SystemAlertProps>){
        this.#runningAppsDispatch({
            type: "UPDATE-APP-PROPS",
            app_running_id: this.#dialogueID,
            props: props
        })
    }
}