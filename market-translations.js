/**
 * Dicionário de Traduções para Campos Market - Surebets
 * Este arquivo contém as traduções dos campos market da API para melhorar a legibilidade
 * dos cards de surebet para usuários brasileiros.
 */

// Dicionário de substituições para melhorar a legibilidade dos campos market
export const MARKET_TRANSLATIONS = {
    // Handicaps Asiáticos
    'AH1': 'Handicap Asiático - Casa',
    'AH2': 'Handicap Asiático - Visitante',
    
    // Handicaps Europeus
    'EH1': 'Handicap Europeu - Casa',
    'EH2': 'Handicap Europeu - Visitante',
    
    // Over/Under
    'TO': 'Over',
    'TU': 'Under',
    
    // Resultados
    '1X2': 'Resultado Final',
    'DC': 'Dupla Chance',
    'BTS': 'Ambas Marcam',
    'CS': 'Placar Exato',
    
    // Tempos
    'HT': 'Primeiro Tempo',
    'FT': 'Tempo Completo',
    
    // Par/Ímpar
    'Even': 'Total de Gols – Par',
    'Odd': 'Total de Gols – Ímpar',
    
    // Específicos por Time
    'for Team1': 'Casa',
    'for Team2': 'Visitante',
    
    // Estatísticas
    'Corners': 'Escanteios',
    'YC': 'Cartão Amarelo',
    'RC': 'Cartão Vermelho',
    'FOULS': 'Faltas',
    'OFFSIDES': 'Impedimentos',
    'SHOTS': 'Chutes',
    'POSSESSION': 'Posse de Bola'
}

/**
 * Função para aplicar traduções nos campos market
 * @param {string} marketText - Texto original do campo market
 * @returns {string} - Texto traduzido
 */
export function translateMarketField(marketText) {
    if (!marketText) return marketText
    
    let translatedText = marketText
    
    // Aplicar todas as substituições do dicionário
    Object.entries(MARKET_TRANSLATIONS).forEach(([original, translation]) => {
        // Usar regex para substituir apenas quando for uma palavra completa
        const regex = new RegExp(`\\b${original}\\b`, 'g')
        translatedText = translatedText.replace(regex, translation)
    })
    
    return translatedText
}

/**
 * Função para formatar o campo market para exibição
 * @param {string} marketText - Texto original do campo market
 * @returns {string} - Texto formatado e traduzido para exibição
 */
export function formatMarketForDisplay(marketText) {
    if (!marketText) return 'N/A'
    
    const translated = translateMarketField(marketText)
    
    // Adicionar formatação adicional se necessário
    // Por exemplo, se contém números entre parênteses, formatar melhor
    if (translated.includes('(') && translated.includes(')')) {
        return translated.replace(/\(([^)]+)\)/g, ' ($1)')
    }
    
    return translated
}

/**
 * Função para obter apenas as traduções disponíveis
 * @returns {Object} - Objeto com as traduções disponíveis
 */
export function getAvailableTranslations() {
    return { ...MARKET_TRANSLATIONS }
}

/**
 * Função para verificar se uma tradução existe para um termo específico
 * @param {string} term - Termo a ser verificado
 * @returns {boolean} - True se existe tradução, false caso contrário
 */
export function hasTranslation(term) {
    return term in MARKET_TRANSLATIONS
}

/**
 * Função para obter a tradução de um termo específico
 * @param {string} term - Termo a ser traduzido
 * @returns {string|null} - Tradução se existir, null caso contrário
 */
export function getTranslation(term) {
    return MARKET_TRANSLATIONS[term] || null
}

// Exemplo de uso:
/*
import { formatMarketForDisplay, MARKET_TRANSLATIONS } from './market-translations.js'

// No seu card de surebet:
const marketDisplay = formatMarketForDisplay(surebet.market)
// Resultado: "AH1(-1)" → "Handicap Asiático - Casa (-1)"

// Ou usar diretamente:
const translated = translateMarketField('AH2(+1.5)')
// Resultado: "Handicap Asiático - Visitante(+1.5)"
*/
