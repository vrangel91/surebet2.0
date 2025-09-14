/**
 * Script para contar campeonatos únicos no arquivo de traduções
 */

const fs = require("fs");
const path = require("path");

const filePath = path.join(
  process.cwd(),
  "client/src/config/tournamentTranslations.json"
);

try {
  const data = fs.readFileSync(filePath, "utf8");
  const tournamentData = JSON.parse(data);

  const translations = tournamentData.translations;
  const patterns = tournamentData.patterns;
  const fallbacks = tournamentData.fallbacks;

  // Contar traduções únicas (valores únicos)
  const uniqueTranslations = new Set(Object.values(translations));

  // Contar todas as chaves (variações)
  const totalVariations = Object.keys(translations).length;

  // Contar padrões
  const totalPatterns = Object.keys(patterns).length;

  // Contar fallbacks
  const totalFallbacks = Object.keys(fallbacks).length;

  console.log("📊 ESTATÍSTICAS DE CAMPEONATOS MAPEADOS");
  console.log("=====================================");
  console.log(`📝 Total de variações mapeadas: ${totalVariations}`);
  console.log(`🎯 Campeonatos únicos: ${uniqueTranslations.size}`);
  console.log(`🔍 Padrões de detecção: ${totalPatterns}`);
  console.log(`🔄 Fallbacks: ${totalFallbacks}`);
  console.log("");

  console.log("🏆 CAMPEONATOS ÚNICOS MAPEADOS:");
  console.log("==============================");

  // Agrupar por categoria
  const categories = {
    Futebol: [],
    Basquete: [],
    Tênis: [],
    "Futebol Americano": [],
    Esports: [],
    Outros: [],
  };

  uniqueTranslations.forEach((tournament) => {
    if (
      tournament.includes("Premier") ||
      tournament.includes("La Liga") ||
      tournament.includes("Serie A") ||
      tournament.includes("Bundesliga") ||
      tournament.includes("Ligue") ||
      tournament.includes("Brasileirão") ||
      tournament.includes("Champions") ||
      tournament.includes("Europa") ||
      tournament.includes("Copa") ||
      tournament.includes("Eurocopa") ||
      tournament.includes("Championship") ||
      tournament.includes("Segunda")
    ) {
      categories["Futebol"].push(tournament);
    } else if (
      tournament.includes("NBA") ||
      tournament.includes("WNBA") ||
      tournament.includes("EuroLeague") ||
      tournament.includes("NBB") ||
      tournament.includes("NCAA") ||
      tournament.includes("Basquete")
    ) {
      categories["Basquete"].push(tournament);
    } else if (
      tournament.includes("Wimbledon") ||
      tournament.includes("US Open") ||
      tournament.includes("Roland") ||
      tournament.includes("Australian") ||
      tournament.includes("ATP") ||
      tournament.includes("WTA")
    ) {
      categories["Tênis"].push(tournament);
    } else if (
      tournament.includes("NFL") ||
      tournament.includes("Super Bowl") ||
      tournament.includes("Football")
    ) {
      categories["Futebol Americano"].push(tournament);
    } else if (
      tournament.includes("Counter-Strike") ||
      tournament.includes("League of Legends") ||
      tournament.includes("Dota") ||
      tournament.includes("Valorant")
    ) {
      categories["Esports"].push(tournament);
    } else {
      categories["Outros"].push(tournament);
    }
  });

  Object.entries(categories).forEach(([category, tournaments]) => {
    if (tournaments.length > 0) {
      console.log(`\n${category} (${tournaments.length}):`);
      tournaments.sort().forEach((tournament) => {
        console.log(`  • ${tournament}`);
      });
    }
  });

  console.log("\n📈 RESUMO:");
  console.log("==========");
  console.log(`✅ Total de campeonatos únicos: ${uniqueTranslations.size}`);
  console.log(`✅ Total de variações: ${totalVariations}`);
  console.log(
    `✅ Cobertura estimada: ${Math.round(
      (uniqueTranslations.size / 100) * 100
    )}% de 100+ campeonatos`
  );
} catch (error) {
  console.error("❌ Erro ao processar arquivo:", error.message);
}
