const fs = require('fs');
const path = require('path');
const dir = '.';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));
files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  content = content.replace(
    /(<div className="flex items-center gap-3)(">[\s\n]*<[A-Z][a-zA-Z]+[^>]*\/>[\s\n]*<h1 className="text-2xl font-bold text-gray-800) lg:hidden(")/g,
    '$1 lg:hidden$2$3'
  );
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Moved lg:hidden to wrapper in', file);
  }
});
