#!/usr/bin/env node

/**
 * Navigation Migration Helper Script
 *
 * This script helps migrate navigation code from React Navigation to Expo Router
 * by finding and listing files that need to be updated.
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

// Patterns to search for
const patterns = [
    {
        name: 'useNavigation import',
        regex: /import\s+{\s*useNavigation\s*}\s+from\s+['"]@react-navigation\/native['"]/g,
        replacement: "import { useRouter } from 'expo-router'",
        color: colors.red,
    },
    {
        name: 'useNavigation hook',
        regex: /const\s+navigation\s+=\s+useNavigation\(\)/g,
        replacement: 'const router = useRouter()',
        color: colors.yellow,
    },
    {
        name: 'navigation.navigate',
        regex: /navigation\.navigate\(/g,
        replacement: 'router.push(',
        color: colors.magenta,
    },
    {
        name: 'navigation.push',
        regex: /navigation\.push\(/g,
        replacement: 'router.push(',
        color: colors.magenta,
    },
    {
        name: 'navigation.goBack',
        regex: /navigation\.goBack\(\)/g,
        replacement: 'router.back()',
        color: colors.cyan,
    },
    {
        name: 'navigation.replace',
        regex: /navigation\.replace\(/g,
        replacement: 'router.replace(',
        color: colors.cyan,
    },
    {
        name: 'useRoute import',
        regex: /import\s+{\s*useRoute\s*}\s+from\s+['"]@react-navigation\/native['"]/g,
        replacement: "import { useLocalSearchParams } from 'expo-router'",
        color: colors.red,
    },
    {
        name: 'useRoute hook',
        regex: /const\s+route\s+=\s+useRoute\(\)/g,
        replacement: 'const params = useLocalSearchParams()',
        color: colors.yellow,
    },
    {
        name: 'route.params',
        regex: /route\.params/g,
        replacement: 'params',
        color: colors.blue,
    },
    {
        name: 'navigation.setOptions',
        regex: /navigation\.setOptions\(/g,
        replacement: '// Use <Stack.Screen options={...} /> instead',
        color: colors.yellow,
    },
];

// Statistics
const stats = {
    totalFiles: 0,
    filesWithIssues: 0,
    totalMatches: 0,
};

// Store files with issues
const filesWithIssues = new Map();

/**
 * Recursively search directory for files
 */
function searchDirectory(dir, fileExtensions = ['.tsx', '.ts', '.jsx', '.js']) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Skip node_modules and other directories
            if (!file.startsWith('.') && file !== 'node_modules' && file !== '__tests__') {
                searchDirectory(filePath, fileExtensions);
            }
        } else {
            const ext = path.extname(file);
            if (fileExtensions.includes(ext)) {
                stats.totalFiles++;
                analyzeFile(filePath);
            }
        }
    });
}

/**
 * Analyze a single file
 */
function analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = [];

    patterns.forEach(pattern => {
        const regex = new RegExp(pattern.regex.source, 'gm');
        let match;

        while ((match = regex.exec(content)) !== null) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            matches.push({
                pattern: pattern.name,
                line: lineNumber,
                match: match[0],
                replacement: pattern.replacement,
                color: pattern.color,
            });
            stats.totalMatches++;
        }
    });

    if (matches.length > 0) {
        stats.filesWithIssues++;
        filesWithIssues.set(filePath, matches);
    }
}

/**
 * Print results
 */
function printResults() {
    console.log('\n' + colors.bright + '═'.repeat(80) + colors.reset);
    console.log(colors.bright + colors.cyan + '  EXPO ROUTER MIGRATION REPORT' + colors.reset);
    console.log(colors.bright + '═'.repeat(80) + colors.reset + '\n');

    console.log(colors.bright + 'Statistics:' + colors.reset);
    console.log(`  Total files scanned: ${colors.green}${stats.totalFiles}${colors.reset}`);
    console.log(`  Files needing updates: ${colors.yellow}${stats.filesWithIssues}${colors.reset}`);
    console.log(`  Total patterns found: ${colors.red}${stats.totalMatches}${colors.reset}\n`);

    if (filesWithIssues.size === 0) {
        console.log(colors.green + '✅ No migration issues found! Your project is ready.' + colors.reset + '\n');
        return;
    }

    console.log(colors.bright + '─'.repeat(80) + colors.reset);
    console.log(colors.bright + 'Files requiring updates:' + colors.reset);
    console.log(colors.bright + '─'.repeat(80) + colors.reset + '\n');

    filesWithIssues.forEach((matches, filePath) => {
        const relativePath = path.relative(process.cwd(), filePath);
        console.log(colors.bright + colors.blue + `\n📄 ${relativePath}` + colors.reset);
        console.log(colors.bright + `   (${matches.length} ${matches.length === 1 ? 'issue' : 'issues'})` + colors.reset);

        matches.forEach((match, index) => {
            console.log(`\n   ${index + 1}. ${match.color}${match.pattern}${colors.reset} at line ${match.line}`);
            console.log(`      Found: ${colors.red}${match.match}${colors.reset}`);
            console.log(`      Replace with: ${colors.green}${match.replacement}${colors.reset}`);
        });

        console.log('');
    });

    console.log(colors.bright + '─'.repeat(80) + colors.reset);
    console.log(colors.bright + '\n📋 Next Steps:' + colors.reset);
    console.log(`
  1. Update imports: ${colors.cyan}useNavigation${colors.reset} → ${colors.green}useRouter${colors.reset}
  2. Update hook usage: ${colors.cyan}navigation${colors.reset} → ${colors.green}router${colors.reset}
  3. Update method calls: ${colors.cyan}navigate()${colors.reset} → ${colors.green}push()${colors.reset}
  4. Update route params: ${colors.cyan}route.params${colors.reset} → ${colors.green}useLocalSearchParams()${colors.reset}
  5. Move setOptions to: ${colors.green}<Stack.Screen options={{...}} />${colors.reset}

  ${colors.yellow}💡 Tip: Use the helper functions in src/lib/navigation.ts during migration${colors.reset}
  ${colors.yellow}💡 Tip: See MIGRATION_EXAMPLES.md for detailed code examples${colors.reset}
`);

    console.log(colors.bright + '─'.repeat(80) + colors.reset + '\n');
}

/**
 * Generate a migration summary file
 */
function generateSummaryFile() {
    const summaryPath = path.join(__dirname, '..', 'MIGRATION_SUMMARY.txt');
    let summary = '# Navigation Migration Summary\n\n';
    summary += `Generated: ${new Date().toISOString()}\n\n`;
    summary += `Total files scanned: ${stats.totalFiles}\n`;
    summary += `Files needing updates: ${stats.filesWithIssues}\n`;
    summary += `Total patterns found: ${stats.totalMatches}\n\n`;
    summary += '═'.repeat(80) + '\n\n';

    if (filesWithIssues.size > 0) {
        summary += 'Files requiring updates:\n\n';

        filesWithIssues.forEach((matches, filePath) => {
            const relativePath = path.relative(process.cwd(), filePath);
            summary += `\n${relativePath} (${matches.length} ${matches.length === 1 ? 'issue' : 'issues'})\n`;

            matches.forEach((match, index) => {
                summary += `  ${index + 1}. ${match.pattern} at line ${match.line}\n`;
                summary += `     Found: ${match.match}\n`;
                summary += `     Replace with: ${match.replacement}\n\n`;
            });
        });
    } else {
        summary += 'No migration issues found!\n';
    }

    fs.writeFileSync(summaryPath, summary);
    console.log(colors.green + `✅ Summary saved to: ${summaryPath}${colors.reset}\n`);
}

/**
 * Main function
 */
function main() {
    console.log(colors.bright + '\n🔍 Scanning project for navigation patterns...\n' + colors.reset);

    if (!fs.existsSync(SRC_DIR)) {
        console.error(colors.red + `Error: Source directory not found: ${SRC_DIR}` + colors.reset);
        process.exit(1);
    }

    searchDirectory(SRC_DIR);
    printResults();
    generateSummaryFile();

    process.exit(filesWithIssues.size > 0 ? 1 : 0);
}

// Run the script
main();
