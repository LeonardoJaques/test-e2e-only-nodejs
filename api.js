import JWT from "jsonwebtoken";
import { once } from "node:events";
import { createServer } from "node:http";

const DEFAULT_USER = {
  user: "leonardojaques",
  password: "123",
};
const JWT_KEY = "123secret";
async function loginRoute(request, response) {
  const { user, password } = JSON.parse(await once(request, "data"));
  if (user !== DEFAULT_USER.user || password !== DEFAULT_USER.password) {
    response.writeHead(401);
    response.end(JSON.stringify({ error: "user or password invalid" }));
    return;
  }
  const token = JWT.sign({ user, message: "hey you" }, JWT_KEY);

  response.end(JSON.stringify({ token }));
}
function isHeadersValid(headers) {
  try {
    const auth = headers.authorization.replace(/bearer\s/gi, "");
    JWT.verify(auth, JWT_KEY);
    return true;
  } catch (error) {
    return false;
  }
}
async function handler(request, response) {
  if (request.url === "/login" && request.method === "POST") {
    return loginRoute(request, response);
  }
  if (!isHeadersValid(request.headers)) {
    response.writeHead(400);
    return response.end(JSON.stringify({ error: " invalid token!" }));
  }
  response.end(json.stringify({ result: "Hey welcome" }));
}

const port = 3000;
const app = createServer(handler).listen(
  port,
  console.log(`Server is running in port: ${port}`)
);

export { app };
