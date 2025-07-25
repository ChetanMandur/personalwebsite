import FileExplorer,{ FileExplorerProps }  from "./FileExplorer/FileExplorer";
import HelloWorld, { HelloWorldProps } from "./HelloWorld/HelloWorld";
import { MediaController, MediaControllerProps } from "./MediaController/MediaController";
import { MediaViewer, MediaViewerProps } from "./MediaViewer/MediaViewer";
import SystemAlert, { SystemAlertOptions, SystemAlertProps } from "./SystemAlert/SystemAlert";

export type AppProperties = {
  name: string;
  icon: string;
  
  // eslint-disable-next-line no-empty-pattern, @typescript-eslint/no-explicit-any
  app: ({}:any)=>JSX.Element;
  /////^^^ONE DAY I WILL FIX THIS, until then yolo
  props: object,
  defaultWidthRatio: number;
  defaultHeightRatio:number,
  hidden: boolean,
}

type AppListType = {
  [key:string] : AppProperties
}
const defaultAppProperties: AppProperties = {
  name:"undefined-app",
  icon:"https://www.svgrepo.com/show/487018/alien.svg",
  app: HelloWorld ,
  props:{name:"default", ohmylord:"default"} as HelloWorldProps,
  defaultWidthRatio: 1/4,
  defaultHeightRatio: 1/2,
  hidden: false
}

export const AppList : AppListType = {
  "HelloWorld": {
    ...defaultAppProperties,
    name:"Hello World",
    icon:"https://www.svgrepo.com/show/521265/world-1.svg",
    app: HelloWorld,
    props:{name:"Hello World", ohmylord:"Yes my child"} as HelloWorldProps,
    defaultHeightRatio:1/2,
    defaultWidthRatio:1/2.5
  },
  "FileExplorer":{
    ...defaultAppProperties,
    name:"File Explorer",
    icon:"https://www.svgrepo.com/show/486676/folder-outline.svg",
    app: FileExplorer,
    props:{path:"/"} as FileExplorerProps,
    defaultHeightRatio:1/2,
    defaultWidthRatio:1/2.5
  },
  "MediaViewer":{
    ...defaultAppProperties,
    name:"Media Viewer",
    icon:"https://www.svgrepo.com/show/486284/data-center-table-management.svg",
    app: MediaViewer,
    props:{fileName: null, fileContent:null} as MediaViewerProps,
    defaultHeightRatio:1/3,
    defaultWidthRatio:1/3
  },
  "MediaController":{
    ...defaultAppProperties,
    name: "Media Controller",
    icon:"https://www.svgrepo.com/show/480630/controller-3.svg",
    app: MediaController,
    props: {mediaType:"NONE"} as MediaControllerProps,
    hidden: true

  },
  "SystemAlert":{
    ...defaultAppProperties,
    name: "System Alert",
    icon: "https://www.svgrepo.com/show/498918/alert-box.svg",
    app: SystemAlert,
    props: { message: "Default message", options: {} as SystemAlertOptions, closeButton:{display:true} } as SystemAlertProps,
    defaultHeightRatio: 1/6,
    defaultWidthRatio: 1/4,

  },
  "Default App Properties Test": {
    ...defaultAppProperties,
  }
}