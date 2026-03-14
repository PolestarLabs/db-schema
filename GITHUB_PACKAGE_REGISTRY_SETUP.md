# Publishing this package to GitHub Package Registry

This repository (**database_schema**) is the package published as **@polestarlabs/database_schema** on [GitHub Package Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry).

**Requirement:** The npm scope must match the GitHub org name (lowercase). Our org is **PolestarLabs**, so the scope is **@polestarlabs**. Using `@polestar` causes 403 `permission_denied: create_package`.

---

## What you need to do (tokens & commands)

- **Step 1:** Create a GitHub Personal Access Token (classic) with `read:packages`, `write:packages` (and `repo` if this repo is private). Do not commit the token.
- **Step 2:** From this repo run:  
  `npm login --scope=@polestarlabs --auth-type=legacy --registry=https://npm.pkg.github.com`  
  Use your GitHub username and the token as the password.
- **Step 3:** Run `npm publish` in this repo.
- **Step 4:** In bot, dashboard, and dashboard/api, set **`GITHUB_TOKEN`** to your PAT (or a token with `read:packages`) before running `npm install` or `bun install`. Use an env var or `.env` (gitignored); do not put the token in committed files.

All file edits (package.json, .npmrc, consuming deps) are already done.

---

## 1. Create a GitHub Personal Access Token (classic)

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**.
2. **Generate new token (classic)**.
3. Scopes: **`read:packages`**, **`write:packages`** (and **`repo`** if the repo is private and you publish from local).
4. Copy the token (e.g. `ghp_xxxx`).

---

## 2. Configure this repository for publishing

### 2.1 `package.json`

Ensure `package.json` in this repo has:

- **`name`**: `@polestarlabs/database_schema`
- **`repository`**: GitHub URL of this repo, e.g. `https://github.com/PolestarLabs/database_schema`
- **`publishConfig.registry`**: `https://npm.pkg.github.com`

Example:

```json
{
  "name": "@polestarlabs/database_schema",
  "version": "0.19.0",
  "repository": "https://github.com/PolestarLabs/database_schema",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

### 2.2 Optional: `.npmrc` in this repo

So `npm publish` always uses GPR:

```
@polestarlabs:registry=https://npm.pkg.github.com
```

---

## 3. Publish from this repository

```bash
cd /path/to/database_schema

# Log in to GitHub Package Registry (password = your PAT)
npm login --scope=@polestarlabs --auth-type=legacy --registry=https://npm.pkg.github.com
# Username: YOUR_GITHUB_USERNAME
# Password: ghp_xxxx (your token)

npm publish
```

If the repo is private, the PAT needs **repo** (or equivalent) as well.

---

## 4. Consuming projects (bot, dashboard, dashboard/api)

After publishing, consuming projects should:

1. **Use the registry version** in `package.json`:
   ```json
   "@polestarlabs/database_schema": "^0.19.0"
   ```
   (or whatever version you published.)

2. **Authenticate for install:**
   - **Bun:** Set `GITHUB_TOKEN`; those projects already have `bunfig.toml` with `[install.scopes]` for `@polestarlabs`.
   - **npm/yarn:** Add `.npmrc` in the project:
     ```
     @polestarlabs:registry=https://npm.pkg.github.com
     //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
     ```
     Then set `GITHUB_TOKEN` and run `npm install` or `yarn`.

3. **Optional:** Remove any preinstall/postinstall or `bun-install-github.js` workaround used for the git dependency.

---

## Summary

| Step | Where | Action |
|------|--------|--------|
| 1 | GitHub | Create PAT with `read:packages`, `write:packages` (and `repo` if private). |
| 2 | **database_schema** repo | Set `repository` and `publishConfig.registry` in `package.json`. |
| 3 | **database_schema** repo | `npm login --scope=@polestarlabs --auth-type=legacy --registry=https://npm.pkg.github.com`, then `npm publish`. |
| 4 | bot, dashboard, api | Dep is `"@polestarlabs/database_schema": "^x.x.x"`. Set `GITHUB_TOKEN`; run `bun install` or npm/yarn. |

References:

- [Working with the npm registry (GitHub Docs)](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
- [Configure a private registry for a scope (Bun)](https://bun.com/docs/guides/install/registry-scope)
