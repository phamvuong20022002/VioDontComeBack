import ACTIONS from "../Actions";

export const isLastClient = (socket, roomId) => {
    return new Promise( async (resolve, reject) => {
        // Request code from server
        await socket.emit(ACTIONS.LEAVE,{roomId});
  
        // Listen for data response from the server
        await socket.on(ACTIONS.LEAVE, ({isLastClient}) => {
            // Resolve the Promise with the received code
            resolve(isLastClient);
        });
    });
}