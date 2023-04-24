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

  return response.end(JSON.stringify({ token }));
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

async function createProductRoute(request, response) {
  const { description, price } = JSON.parse(await once(request, "data"));

  // 0 - 50 basic
  // 51 - 100 regular
  // 101 - 500 premium
  let categories = {
    premium: {
      from: 101,
      to: 500,
    },
    regular: {
      from: 50,
      to: 100,
    },
    basic: {
      from: 0,
      to: 50,
    },
  };
  const category = Object.keys(categories).find((keys) => {
    const category = categories[keys];
    return price >= category.from && price <= category.to;
  });
  return response.end(JSON.stringify({ category }));
}
async function handler(request, response) {
  if (request.url === "/login" && request.method === "POST") {
    return loginRoute(request, response);
  }

  if (!isHeadersValid(request.headers)) {
    response.writeHead(400);
    return response.end(JSON.stringify({ error: " invalid token!" }));
  }
  if (request.url === "/products" && request.method === "POST") {
    return createProductRoute(request, response);
  }

  response.writeHead(404);
  response.end("not found");
}

const port = 3000;
const app = createServer(handler).listen(
  port,
  console.log(`Server is running in port: ${port}`)
);

export { app };
