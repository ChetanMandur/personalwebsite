import HelloWorld from "./HelloWorld/HelloWorld";

type AppProperties = {
  name: string;
  icon: string;
  app: () => JSX.Element;
}

type AppListType = {
  [key:string] : AppProperties
}

export var AppList : AppListType = {
  "HelloWorld": {
    name:"Hello World",
    icon:"🌍",
    app: HelloWorld,
  }
}