#!/usr/bin/env node
// Sync the app version name + build number across iOS and Android in one shot,
// so the two platforms can never drift again.
//
// Usage:
//   node scripts/bump-version.mjs 1.2.0     set an explicit version name
//   node scripts/bump-version.mjs patch     bump the patch component (x.y.Z)
//   node scripts/bump-version.mjs minor     bump the minor component (x.Y.0)
//   node scripts/bump-version.mjs major     bump the major component (X.0.0)
//   node scripts/bump-version.mjs           keep the version name, bump build only
//
// The build number (iOS CURRENT_PROJECT_VERSION / Android versionCode) is a
// single monotonic integer = max(iOS, Android) + 1, which also self-heals any
// existing drift between the two projects.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const gradlePath = resolve(root, "android/app/build.gradle");
const pbxPath = resolve(root, "ios/App/App.xcodeproj/project.pbxproj");

let gradle = readFileSync(gradlePath, "utf8");
let pbx = readFileSync(pbxPath, "utf8");

const androidName = gradle.match(/versionName\s+"([^"]+)"/)?.[1];
const androidCode = parseInt(gradle.match(/versionCode\s+(\d+)/)?.[1] ?? "0", 10);
const iosName = pbx.match(/MARKETING_VERSION\s*=\s*([0-9.]+);/)?.[1];
const iosBuild = parseInt(pbx.match(/CURRENT_PROJECT_VERSION\s*=\s*(\d+);/)?.[1] ?? "0", 10);

if (!androidName || !iosName) {
  console.error("bump-version: could not read current versions from the native projects.");
  process.exit(1);
}

// Compare dotted version strings numerically. Returns >0 if a > b.
function cmp(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d !== 0) return d;
  }
  return 0;
}

// Self-heal: the current version name is the higher of the two platforms'.
const currentName = cmp(androidName, iosName) >= 0 ? androidName : iosName;

const arg = process.argv[2];
let newName = currentName;
if (arg && ["major", "minor", "patch"].includes(arg)) {
  const p = currentName.split(".").map(Number);
  while (p.length < 3) p.push(0);
  if (arg === "major") { p[0]++; p[1] = 0; p[2] = 0; }
  else if (arg === "minor") { p[1]++; p[2] = 0; }
  else { p[2]++; }
  newName = p.join(".");
} else if (arg) {
  if (!/^\d+\.\d+(\.\d+)?$/.test(arg)) {
    console.error(`bump-version: invalid version "${arg}". Use X.Y[.Z], or patch|minor|major.`);
    process.exit(1);
  }
  newName = arg;
}

const newBuild = Math.max(androidCode, iosBuild) + 1;

gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${newBuild}`);
gradle = gradle.replace(/versionName\s+"[^"]+"/, `versionName "${newName}"`);
pbx = pbx.replaceAll(/MARKETING_VERSION = [0-9.]+;/g, `MARKETING_VERSION = ${newName};`);
pbx = pbx.replaceAll(/CURRENT_PROJECT_VERSION = \d+;/g, `CURRENT_PROJECT_VERSION = ${newBuild};`);

writeFileSync(gradlePath, gradle);
writeFileSync(pbxPath, pbx);

console.log("bump-version: updated iOS + Android in lockstep");
console.log(`  version:  ${currentName}  ->  ${newName}`);
console.log(`  build:    iOS ${iosBuild} / Android ${androidCode}  ->  ${newBuild} (both)`);
