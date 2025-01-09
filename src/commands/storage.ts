import { CommandType, RetrieveFileListCommand } from "../commands";
import { EventType } from "../events";

export const RetrieveFileList: RetrieveFileListCommand = {
  type: CommandType.RetrieveFileList,
  execute: (dispatch) => {
    dispatch({
      type: EventType.RetrieveFileListSuccess,
      data: ["file001.txt", "file005.txt", "file014.txt"], // TODO:
    });
  },
};
