import {createSocketMessageClass, SocketMessage} from "./SocketMessage";
import {GameItem} from "../Games/GameManager";

export const GameMessage = createSocketMessageClass<GameItem>("game");