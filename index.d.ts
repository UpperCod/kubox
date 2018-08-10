declare module "kubox" {
    export default class{
        readonly state: Object
        readonly actions: Object
        constructor(state:Object, actions?:Object,middleware?:Function)
        setActions(actions:Object, middleware?: Function, space ?: String):void
        subscribe(handler:Function, space?:String):any
    }
}
  