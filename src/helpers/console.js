import env from "env";

export function devLog(...log) {
  if(env.name === "development") console.log(log);
};
