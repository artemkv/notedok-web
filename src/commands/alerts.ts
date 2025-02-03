import { CommandType, ReportErrorCommand } from "../commands";

export const ReportError = (err: unknown): ReportErrorCommand => ({
  type: CommandType.ReportError,
  err,
  execute: async () => {
    console.error(err);
    alert(err);
  },
});
