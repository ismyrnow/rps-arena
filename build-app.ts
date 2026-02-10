import { cpSync } from "node:fs";
import BunPluginTailwind from "bun-plugin-tailwind";

console.log("Copying public images... ");
cpSync("./public/images", "./dist/public/images", { recursive: true });

console.log("Building server and client...");
await Bun.build({
  outdir: "./dist",
  plugins: [BunPluginTailwind],
  minify: true,
  entrypoints: ["./src/index.ts"],
  target: "bun",
  sourcemap: true,
});

console.log("Build completed");
