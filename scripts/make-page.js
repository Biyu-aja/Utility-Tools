#!/usr/bin/env node

/**
 * CLI Generator for Pages, Routes, and Sidemenu items
 * 
 * Usage:
 *   node scripts/make-page.js <PageName> [--icon <LucideIconName>]
 *   npm run make:page <PageName>
 *   npm run make:page <PageName> -- --icon Settings
 */

import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')

// Helper functions for naming conventions
function toPascalCase(str) {
  return str
    .replace(/[-_](\w)/g, (_, c) => c.toUpperCase())
    .replace(/^\w/, (c) => c.toUpperCase())
    .replace(/\s+/g, '')
}

function toRoutePath(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
}

function parseArgs() {
  const args = process.argv.slice(2)
  let pageName = ''
  let iconName = 'LayoutDashboard'
  let skipMenu = false

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--icon' || arg === '-i') {
      iconName = args[++i] || 'LayoutDashboard'
    } else if (arg === '--no-menu') {
      skipMenu = true
    } else if (!arg.startsWith('-') && !pageName) {
      pageName = arg
    }
  }

  return { pageName, iconName, skipMenu }
}

async function promptInput(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

async function main() {
  let { pageName, iconName, skipMenu } = parseArgs()

  if (!pageName) {
    console.log('\n✨ \x1b[1m\x1b[36mReact Page Generator CLI\x1b[0m ✨\n')
    pageName = await promptInput('Enter page name (e.g. Analytics, Settings): ')
    if (!pageName) {
      console.error('\x1b[31mError: Page name is required.\x1b[0m')
      process.exit(1)
    }

    const customIcon = await promptInput(`Enter Lucide icon (default: ${iconName}): `)
    if (customIcon) {
      iconName = customIcon
    }
  }

  const pascalName = toPascalCase(pageName)
  const routePath = toRoutePath(pageName)

  console.log(`\n🚀 Generating page: \x1b[32m${pascalName}\x1b[0m (route: \x1b[33m/${routePath}\x1b[0m, icon: \x1b[34m${iconName}\x1b[0m)...`)

  // 1. Create src/pages/<PascalName>.tsx
  const pageFilePath = path.join(ROOT_DIR, 'src', 'pages', `${pascalName}.tsx`)
  if (fs.existsSync(pageFilePath)) {
    console.log(`⚠️  File \x1b[33msrc/pages/${pascalName}.tsx\x1b[0m already exists. Skipping page file creation.`)
  } else {
    const pageContent = `/**
 * Folder: src/pages/
 * Description: Stores page-level components rendered by React Router.
 * This file: ${pascalName}.tsx (${pascalName} page).
 */

export function ${pascalName}Page() {
  return (
    <p>${pascalName}</p>
  )
}

export default ${pascalName}Page
`
    fs.writeFileSync(pageFilePath, pageContent, 'utf-8')
    console.log(`✅ Created \x1b[32msrc/pages/${pascalName}.tsx\x1b[0m`)
  }

  // 2. Update src/constants/listed.ts
  const listedFilePath = path.join(ROOT_DIR, 'src', 'constants', 'listed.ts')
  if (fs.existsSync(listedFilePath)) {
    let listedContent = fs.readFileSync(listedFilePath, 'utf-8')
    if (!listedContent.includes(`${pascalName}:`)) {
      const appRoutesRegex = /(export\s+const\s+AppRoutes\s*=\s*\{)([\s\S]*?)(\})/
      listedContent = listedContent.replace(appRoutesRegex, (match, p1, p2, p3) => {
        const lines = p2.trim().split('\n').map((l) => l.trim()).filter(Boolean)
        lines.push(`${pascalName}: "${routePath}",`)
        const formatted = lines.map((l) => `  ${l}`).join('\n')
        return `${p1}\n${formatted}\n${p3}`
      })
      fs.writeFileSync(listedFilePath, listedContent, 'utf-8')
      console.log(`✅ Updated \x1b[32msrc/constants/listed.ts\x1b[0m (Added ${pascalName} route)`)
    } else {
      console.log(`ℹ️  Route \x1b[33mAppRoutes.${pascalName}\x1b[0m already in listed.ts.`)
    }
  }

  // 3. Update src/constants/router.tsx
  const routerFilePath = path.join(ROOT_DIR, 'src', 'constants', 'router.tsx')
  if (fs.existsSync(routerFilePath)) {
    let routerContent = fs.readFileSync(routerFilePath, 'utf-8')

    // Add import if not present
    const importStatement = `import { ${pascalName}Page } from '../pages/${pascalName}'`
    if (!routerContent.includes(`from '../pages/${pascalName}'`)) {
      routerContent = routerContent.replace(
        /(import\s+\{\s*DashboardPage\s*\}\s+from\s+['"]\.\.\/pages\/Dashboard['"])/,
        `$1\n${importStatement}`
      )
    }

    // Add route definition before catch-all route '*'
    const routeDefinition = `      {\n        path: AppRoutes.${pascalName},\n        element: <${pascalName}Page />,\n      },`
    if (!routerContent.includes(`path: AppRoutes.${pascalName}`)) {
      routerContent = routerContent.replace(
        /(\s*\{\s*\n\s*path:\s*'\*',\s*\n\s*element:\s*<Navigate to="\/" replace \/>,\s*\n\s*\},)/,
        `\n${routeDefinition}$1`
      )
      fs.writeFileSync(routerFilePath, routerContent, 'utf-8')
      console.log(`✅ Updated \x1b[32msrc/constants/router.tsx\x1b[0m (Added route configuration)`)
    } else {
      console.log(`ℹ️  Route for \x1b[33m${pascalName}Page\x1b[0m already in router.tsx.`)
    }
  }

  // 4. Update src/constants/sidemenuItems.tsx (unless --no-menu flag)
  if (!skipMenu) {
    const sidemenuFilePath = path.join(ROOT_DIR, 'src', 'constants', 'sidemenuItems.tsx')
    if (fs.existsSync(sidemenuFilePath)) {
      let sidemenuContent = fs.readFileSync(sidemenuFilePath, 'utf-8')

      // Add icon import if not present
      if (!sidemenuContent.includes(iconName)) {
        sidemenuContent = sidemenuContent.replace(
          /(import\s*\{)([^}]+)(\}\s*from\s*['"]lucide-react['"])/,
          (match, p1, p2, p3) => {
            const icons = p2.split(',').map((i) => i.trim()).filter(Boolean)
            if (!icons.includes(iconName)) {
              icons.push(iconName)
            }
            return `${p1} ${icons.join(', ')} ${p3}`
          }
        )
      }

      // Add to sidemenuItems array if not already present
      if (!sidemenuContent.includes(`href: AppRoutes.${pascalName}`)) {
        const menuItem = `  {\n    name: '${pascalName}',\n    href: AppRoutes.${pascalName},\n    icons: <${iconName} className="w-4.5 h-4.5" />,\n  },`
        sidemenuContent = sidemenuContent.replace(
          /(\n\s*\])/,
          `\n${menuItem}$1`
        )
        fs.writeFileSync(sidemenuFilePath, sidemenuContent, 'utf-8')
        console.log(`✅ Updated \x1b[32msrc/constants/sidemenuItems.tsx\x1b[0m (Added menu item with icon ${iconName})`)
      } else {
        console.log(`ℹ️  Menu item for \x1b[33m${pascalName}\x1b[0m already in sidemenuItems.tsx.`)
      }
    }
  }

  console.log(`\n🎉 \x1b[32mPage ${pascalName} created and registered successfully!\x1b[0m\n`)
}

main().catch((err) => {
  console.error('\x1b[31mError generating page:\x1b[0m', err)
  process.exit(1)
})
