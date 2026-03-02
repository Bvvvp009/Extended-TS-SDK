import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

function addJsExtensions(dir) {
  const files = readdirSync(dir);
  
  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      addJsExtensions(filePath);
    } else if (extname(file) === '.ts' && !file.endsWith('.d.ts')) {
      let content = readFileSync(filePath, 'utf8');
      
      // Add .js to relative imports
      content = content.replace(
        /from\s+(['"])(\.\S+?)(?<!\.js)\1/g,
        (match, quote, path) => {
          // Don't add .js if it's already there or if importing .json
          if (path.endsWith('.js') || path.endsWith('.json')) {
            return match;
          }
          return `from ${quote}${path}.js${quote}`;
        }
      );
      
      // Add .js to export from statements
      content = content.replace(
        /export\s+\{[^}]+\}\s+from\s+(['"])(\.\S+?)(?<!\.js)\1/g,
        (match, quote, path) => {
          if (path.endsWith('.js') || path.endsWith('.json')) {
            return match;
          }
          return match.replace(path, `${path}.js`);
        }
      );
      
      // Add .js to export * from statements
      content = content.replace(
        /export\s+\*\s+from\s+(['"])(\.\S+?)(?<!\.js)\1/g,
        (match, quote, path) => {
          if (path.endsWith('.js') || path.endsWith('.json')) {
            return match;
          }
          return match.replace(path, `${path}.js`);
        }
      );
      
      writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  }
}

console.log('Adding .js extensions to imports...');
addJsExtensions('./src');
console.log('Done!');
