import { memo } from "react";
import { OrbitProgress } from "react-loading-indicators";

const OrbitProgressIndicator = memo(function OrbitProgressIndicator() {
  return (
    <OrbitProgress
      variant="dotted"
      color="#a9a9a9"
      style={{ fontSize: "3px" }}
      text=""
      textColor=""
    />
  );
});

export default OrbitProgressIndicator;
