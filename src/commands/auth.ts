import { CommandType, CreateUserSessionCommand } from "../commands";
import { EventType } from "../events";
import { setIdToken } from "../sessionapi";

export const StartUserSession = (
  idToken: string
): CreateUserSessionCommand => ({
  type: CommandType.CreateUserSession,
  idToken,
  execute: async (dispatch) => {
    setIdToken(idToken);
    dispatch({
      type: EventType.UserSessionCreated,
    });
  },
});
