import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { Amplify } from "aws-amplify";
import { fetchAuthSession } from "aws-amplify/auth";
import { useContext, useEffect } from "react";
import AppContext from "../AppContext";
import { EventType } from "../events";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_oDBGh8hef",
      userPoolClientId: "171uojgfrbv775ultuqk12os85",
    },
  },
});

function CognitoSignIn() {
  const { dispatch } = useContext(AppContext);

  const SignedIn = () => {
    useEffect(() => {
      fetchAuthSession().then((s) => {
        if (s.tokens && s.tokens.idToken) {
          dispatch({
            type: EventType.UserAuthenticated,
            idToken: s.tokens.idToken.toString(),
          });
        }
      });
    }, []);

    return <div></div>;
  };

  // TODO: allow signing out
  return (
    <Authenticator loginMechanisms={["email"]}>
      {(/*{ signOut, user }*/) => <SignedIn />}
    </Authenticator>
  );
}

export default CognitoSignIn;
