const fs = require('fs');
const path = require('path');

function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursive(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

const source = "C:\\Users\\Raul\\Desktop\\WORKSPACE\\RepoMed IA\\repomed-web\\TESTES UX\\2025-09-20T19-46-28-518Z";
const dest = "C:\\Users\\Raul\\Desktop\\WORKSPACE\\RepoMed IA\\TESTES UX\\2025-09-20T19-46-28-518Z";

console.log('📁 Copiando arquivos UX...');
console.log(`Origem: ${source}`);
console.log(`Destino: ${dest}`);

try {
  copyRecursive(source, dest);
  console.log('✅ Cópia concluída com sucesso!');

  // Verificar se foi copiado
  const files = fs.readdirSync(path.join(dest, 'routes'));
  console.log(`📊 ${files.length} rotas copiadas:`);
  files.slice(0, 10).forEach(file => console.log(`   - ${file}`));
  if (files.length > 10) console.log(`   ... e mais ${files.length - 10} rotas`);

} catch (error) {
  console.error('❌ Erro na cópia:', error.message);
}