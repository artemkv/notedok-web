// TODO: where to configure it?
// const baseUrl = 'https://notedok.artemkv.net:8070';
const baseUrl = "http://127.0.0.1:8070";

export class ApiError extends Error {
  statusCode: number;
  statusMessage: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(statusCode: number, statusMessage: string, ...params: any[]) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }

    this.name = "ApiError";
    this.statusCode = statusCode;
    this.statusMessage = statusMessage;
  }
}

function handleErrors(response: Response) {
  if (response.status < 400) {
    return response;
  }
  throw new ApiError(response.status, response.statusText, response.statusText);
}

interface StringMap {
  [index: string]: string;
}

interface Data {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

function toJson(response: Response) {
  return response.json();
}

function toText(response: Response) {
  return response.text();
}

function toData(json: Data) {
  return json.data;
}

function getJson(endpoint: string, session?: string) {
  const headers: StringMap = {};
  if (session) {
    headers["x-session"] = session;
  }

  return fetch(baseUrl + endpoint, {
    mode: "cors",
    headers,
  })
    .then(handleErrors)
    .then(toJson)
    .then(toData);
}

function getText(endpoint: string, session?: string) {
  const headers: StringMap = {};
  if (session) {
    headers["x-session"] = session;
  }

  return fetch(baseUrl + endpoint, {
    mode: "cors",
    headers,
  })
    .then(handleErrors)
    .then(toText);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function postJson(endpoint: string, data: any, session?: string) {
  const headers: StringMap = {
    "Content-Type": "application/json",
  };
  if (session) {
    headers["x-session"] = session;
  }

  return fetch(baseUrl + endpoint, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    headers,
    body: data ? JSON.stringify(data) : null,
  })
    .then(handleErrors)
    .then(toJson)
    .then(toData);
}

function postText(endpoint: string, text: string, session?: string) {
  const headers: StringMap = {
    "Content-Type": "text/plain; charset=utf-8",
  };
  if (session) {
    headers["x-session"] = session;
  }

  return fetch(baseUrl + endpoint, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    headers,
    body: text,
  })
    .then(handleErrors)
    .then(toText);
}

/*
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function putJson(endpoint: string, data: any, session?: string) {
  const headers: StringMap = {
    "Content-Type": "application/json",
  };
  if (session) {
    headers["x-session"] = session;
  }

  return fetch(baseUrl + endpoint, {
    method: "PUT",
    mode: "cors",
    cache: "no-cache",
    headers,
    body: data ? JSON.stringify(data) : null,
  })
    .then(handleErrors)
    .then(toJson)
    .then(toData);
}*/

function putText(endpoint: string, text: string, session?: string) {
  const headers: StringMap = {
    "Content-Type": "text/plain; charset=utf-8",
  };
  if (session) {
    headers["x-session"] = session;
  }

  return fetch(baseUrl + endpoint, {
    method: "PUT",
    mode: "cors",
    cache: "no-cache",
    headers,
    body: text,
  })
    .then(handleErrors)
    .then(toText);
}

function deleteObject(endpoint: string, session?: string) {
  const headers: StringMap = {};
  if (session) {
    headers["x-session"] = session;
  }

  return fetch(baseUrl + endpoint, {
    method: "DELETE",
    mode: "cors",
    cache: "no-cache",
    headers,
  }).then(handleErrors);
}

export const signIn = (idToken: string) => {
  return postJson("/signin", { id_token: idToken });
};

export const getFiles = (
  session: string,
  pageSize: number,
  continuationToken: string
) => {
  return getJson(
    `/files?pageSize=${pageSize}&continuationToken=${continuationToken}`,
    session
  );
};

export const getFile = (session: string, filename: string) => {
  return getText(`/files/${filename}`, session);
};

export const postFile = (session: string, filename: string, text: string) => {
  return postText(`/files/${filename}`, text, session);
};

export const putFile = (session: string, filename: string, text: string) => {
  return putText(`/files/${filename}`, text, session);
};

export const renameFile = (
  session: string,
  filename: string,
  newFilename: string
) => {
  const body = {
    fileName: filename,
    newFileName: newFilename,
  };

  return postJson(`/rename`, body, session); // TODO: fails as the response does not return data
};

export const deleteFile = (session: string, filename: string) => {
  return deleteObject(`/files/${filename}`, session);
};
