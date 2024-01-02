import ACTIONS from "../Actions";

export const getStatusSaveRoom = (socket, roomId, save) => {
    return new Promise( async (resolve, reject) => {
        // Request code from server
        await socket.emit(ACTIONS.SAVE_ROOM,{roomId, socketId: socket.id, save});
  
        // Listen for data response from the server
        await socket.on(ACTIONS.SAVE_ROOM, (data) => {
            // Resolve the Promise with the received code
            resolve(data);
        });
    });
}