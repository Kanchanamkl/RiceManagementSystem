const fs = require('fs');
const path = require('path');

function findSupabaseImports(dir, results = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== '.next') {
        findSupabaseImports(filePath, results);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('supabase') || content.includes('Supabase')) {
        results.push(filePath);
      }
    }
  });

  return results;
}

const projectRoot = path.join(__dirname, '..');
const files = findSupabaseImports(projectRoot);

console.log('Files containing Supabase references:');
files.forEach(file => console.log(file));
