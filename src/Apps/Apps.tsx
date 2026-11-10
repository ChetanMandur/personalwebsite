import FileExplorer,{ FileExplorerProps }  from "./FileExplorer/FileExplorer";
import HelloWorld, { HelloWorldProps } from "./HelloWorld/HelloWorld";
import { MediaController, MediaControllerProps } from "./MediaController/MediaController";
import { MediaViewer, MediaViewerProps } from "./MediaViewer/MediaViewer";
import SystemAlert, { SystemAlertProps } from "./SystemAlert/SystemAlert";

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
  icon:"./apps/DefaultAppPropertiesTest/alien[487018].svg",
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
    icon:"./apps/HelloWorld/world-1[521265].svg",
    app: HelloWorld,
    props:{name:"", ohmylord:""} as HelloWorldProps,
    defaultHeightRatio:1/2,
    defaultWidthRatio:1/2.5
  },
  "FileExplorer":{
    ...defaultAppProperties,
    name:"File Explorer",
    icon:"./apps/FileExplorer/folder-outline[486676].svg",
    app: FileExplorer,
    props:{path:"/"} as FileExplorerProps,
    defaultHeightRatio:1/2,
    defaultWidthRatio:1/2.5
  },
  "MediaViewer":{
    ...defaultAppProperties,
    name:"Media Viewer",
    icon:"./apps/Media/MediaViewer/data-center-table-management[486284].svg",
    app: MediaViewer,
    props:{fileName: null, fileContent:null} as MediaViewerProps,
    defaultHeightRatio:1/3,
    defaultWidthRatio:1/3
  },
  "MediaController":{
    ...defaultAppProperties,
    name: "Media Controller",
    icon:"./apps/Media/MediaController/controller-3[480630].svg",
    app: MediaController,
    props: {mediaType:"NONE"} as MediaControllerProps,
    hidden: true

  },
  "SystemAlert":{
    ...defaultAppProperties,
    name: "System Alert",
    icon:"./apps/SystemAlert/alert-box[498918].svg",
    app: SystemAlert,
    props: { message: "Default message", closeButton:{enabled:true} } satisfies SystemAlertProps,
    defaultHeightRatio: 1/6,
    defaultWidthRatio: 1/4,
    hidden: true

  }

  
  // ,"Default App Properties Test": {
  //   ...defaultAppProperties,
  // }
}