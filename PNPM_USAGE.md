# PNPM Usage Guide

This guide provides instructions on how to use pnpm with this project, including basic commands, advantages over npm, migration instructions, and troubleshooting tips.

## What is pnpm?

pnpm is a fast, disk space efficient package manager that uses a unique approach to managing node_modules. Instead of copying packages for each project, pnpm creates a content-addressable store and uses hard links and symlinks to avoid duplication.

## Advantages of pnpm over npm

- **Disk space efficiency**: pnpm uses a content-addressable store which saves disk space by avoiding package duplication
- **Faster installation**: pnpm is significantly faster than npm in most scenarios
- **Strict dependency structure**: Prevents accessing packages that are not explicitly declared as dependencies
- **Deterministic dependency resolution**: Ensures consistent installations across different environments
- **Improved security**: Better isolation between dependencies reduces security risks
- **Built-in monorepo support**: Native features for managing multi-package repositories

## Basic pnpm Commands

### Installing Dependencies

To install all dependencies defined in your package.json:

```
pnpm install
```

Or the shorter version:

```
pnpm i
```

### Adding New Packages

To add a new package as a dependency:

```
pnpm add <package-name>
```

To add a development dependency:

```
pnpm add -D <package-name>
```

Other variations:
- Add as peer dependency: `pnpm add -P <package-name>`
- Add as optional dependency: `pnpm add -O <package-name>`
- Add a specific version: `pnpm add <package-name>@<version>`
- Add from git repository: `pnpm add <package-name>@<git-url>`

### Running Scripts

To run scripts defined in package.json:

```
pnpm <script-name>
```

For example, to run the development server for this project:

```
pnpm dev
```

Other common scripts in this project:
- Build the project: `pnpm build`
- Start production server: `pnpm start`

### Updating Packages

To check for outdated packages:

```
pnpm outdated
```

To update packages to their latest version according to semver:

```
pnpm update
```

To update a specific package:

```
pnpm update <package-name>
```

## Migrating from npm to pnpm

If you've been using npm with this project and want to migrate to pnpm, follow these steps:

1. Install pnpm globally (if not already installed):
   ```
   npm install -g pnpm
   ```

2. Remove existing node_modules directory and package-lock.json:
   ```
   rm -rf node_modules package-lock.json
   ```

3. Install dependencies using pnpm:
   ```
   pnpm install
   ```

4. Verify that everything works:
   ```
   pnpm dev
   ```

## Understanding pnpm-lock.yaml

The `pnpm-lock.yaml` file is pnpm's equivalent to npm's package-lock.json. It contains:

- Exact versions of all installed packages
- Integrity checksums to verify package contents
- Dependencies of each package
- Information needed to reproduce the exact node_modules tree

### Important notes about pnpm-lock.yaml:

- Always commit this file to your repository
- Don't edit it manually
- It's automatically updated when you run commands like `pnpm add` or `pnpm install`
- If conflicts occur during merges, resolve them and run `pnpm install` to regenerate the file

## Troubleshooting Common pnpm Issues

### Node.js version compatibility

If you encounter errors related to Node.js version incompatibility:

1. Check the required Node.js version in package.json
2. Install the correct version using a node version manager like nvm
3. Run `pnpm install` again

### Peer dependency issues

If you see peer dependency warnings:

```
pnpm add <peer-dependency-package>@<required-version>
```

### Permission errors

If you encounter permission errors:

1. On Linux/Mac: `sudo pnpm <command>` (though not recommended)
2. Better approach: Fix npm's global folder permissions or use nvm

### Broken symlinks or hoisting issues

If you experience issues with broken dependencies:

```
pnpm install --force
```

### Cannot find module errors

If modules cannot be found despite being installed:

1. Check that the package is listed in dependencies in package.json
2. Run `pnpm install` to ensure it's properly linked
3. Try clearing the store and reinstalling: `pnpm store prune && pnpm install`

### Switching between package managers

When switching between package managers (npm, yarn, pnpm), it's best to:

1. Remove node_modules directory: `rm -rf node_modules`
2. Remove lock files: `rm -f package-lock.json yarn.lock`
3. Run a fresh install: `pnpm install`

## Additional Resources

- [Official pnpm Documentation](https://pnpm.io/motivation)
- [pnpm GitHub Repository](https://github.com/pnpm/pnpm)
- [pnpm vs npm vs Yarn Comparison](https://pnpm.io/feature-comparison)

## Project-Specific Notes

This project uses pnpm for dependency management. The main scripts available are:

- `pnpm dev`: Starts the development server
- `pnpm build`: Builds the project for production
- `pnpm start`: Runs the production server

Always use pnpm when working with this project to ensure consistent dependency management and to take advantage of its performance benefits.