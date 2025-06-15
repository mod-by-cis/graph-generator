


//import { xxxx } from "../logic/builds/mjs.ts";
import build, {ToDoList} from "../logic/builds/mjs.ts";
//import { xxxx } from "../logic/builds/mjs.ts";

//console.log(new TextDecoder().decode(await xxxx()));

const config1 = build.getInstance();


config1.printConfig()
console.log("----");
config1.toDo = ToDoList.MAIN_CSS;
config1.printConfig()
console.log("----");
