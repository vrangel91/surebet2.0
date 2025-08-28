/**
 * Exemplo de Implementação das Traduções nos Cards da Surebet
 * Este arquivo mostra como usar o sistema de traduções para melhorar
 * a legibilidade dos campos market nos cards de surebet.
 */

import { formatMarketForDisplay, translateMarketField, MARKET_TRANSLATIONS } from './market-translations.js'

/**
 * Exemplo de card de surebet com traduções aplicadas
 */
class SurebetCard {
    constructor(surebetData) {
        this.data = surebetData
        this.translatedMarket = formatMarketForDisplay(surebetData.market)
    }

    /**
     * Renderiza o card com o campo market traduzido
     */
    render() {
        return `
            <div class="surebet-card">
                <div class="card-header">
                    <h3>${this.data.sport || 'Esporte'}</h3>
                    <span class="event">${this.data.event || 'Evento'}</span>
                </div>
                
                <div class="card-body">
                    <div class="market-info">
                        <strong>Mercado:</strong>
                        <span class="market-display">
                            ${this.translatedMarket}
                        </span>
                        <small class="original-market">
                            (Original: ${this.data.market})
                        </small>
                    </div>
                    
                    <div class="odds-info">
                        <div class="odd-item">
                            <span class="bookmaker">${this.data.bookmaker1 || 'Casa 1'}</span>
                            <span class="odd">${this.data.odd1 || 'N/A'}</span>
                        </div>
                        <div class="odd-item">
                            <span class="bookmaker">${this.data.bookmaker2 || 'Casa 2'}</span>
                            <span class="odd">${this.data.odd2 || 'N/A'}</span>
                        </div>
                    </div>
                    
                    <div class="profit-info">
                        <span class="profit-label">Lucro:</span>
                        <span class="profit-value">${this.data.profit || 'N/A'}%</span>
                    </div>
                </div>
            </div>
        `
    }

    /**
     * Retorna apenas o campo market traduzido
     */
    getTranslatedMarket() {
        return this.translatedMarket
    }

    /**
     * Retorna o campo market original
     */
    getOriginalMarket() {
        return this.data.market
    }
}

/**
 * Exemplo de uso em um componente Vue
 */
export const SurebetCardVue = {
    name: 'SurebetCard',
    props: {
        surebet: {
            type: Object,
            required: true
        }
    },
    computed: {
        translatedMarket() {
            return formatMarketForDisplay(this.surebet.market)
        }
    },
    template: `
        <div class="surebet-card">
            <div class="card-header">
                <h3>{{ surebet.sport || 'Esporte' }}</h3>
                <span class="event">{{ surebet.event || 'Evento' }}</span>
            </div>
            
            <div class="card-body">
                <div class="market-info">
                    <strong>Mercado:</strong>
                    <span class="market-display">
                        {{ translatedMarket }}
                    </span>
                    <small class="original-market">
                        (Original: {{ surebet.market }})
                    </small>
                </div>
                
                <div class="odds-info">
                    <div class="odd-item">
                        <span class="bookmaker">{{ surebet.bookmaker1 || 'Casa 1' }}</span>
                        <span class="odd">{{ surebet.odd1 || 'N/A' }}</span>
                    </div>
                    <div class="odd-item">
                        <span class="bookmaker">{{ surebet.bookmaker2 || 'Casa 2' }}</span>
                        <span class="odd">{{ surebet.odd2 || 'N/A' }}</span>
                    </div>
                </div>
                
                <div class="profit-info">
                    <span class="profit-label">Lucro:</span>
                    <span class="profit-value">{{ surebet.profit || 'N/A' }}%</span>
                </div>
            </div>
        </div>
    `
}

/**
 * Exemplo de uso em um componente React
 */
export const SurebetCardReact = ({ surebet }) => {
    const translatedMarket = formatMarketForDisplay(surebet.market)
    
    return (
        <div className="surebet-card">
            <div className="card-header">
                <h3>{surebet.sport || 'Esporte'}</h3>
                <span className="event">{surebet.event || 'Evento'}</span>
            </div>
            
            <div className="card-body">
                <div className="market-info">
                    <strong>Mercado:</strong>
                    <span className="market-display">
                        {translatedMarket}
                    </span>
                    <small className="original-market">
                        (Original: {surebet.market})
                    </small>
                </div>
                
                <div className="odds-info">
                    <div className="odd-item">
                        <span className="bookmaker">{surebet.bookmaker1 || 'Casa 1'}</span>
                        <span className="odd">{surebet.odd1 || 'N/A'}</span>
                    </div>
                    <div className="odd-item">
                        <span className="bookmaker">{surebet.bookmaker2 || 'Casa 2'}</span>
                        <span className="odd">{surebet.odd2 || 'N/A'}</span>
                    </div>
                </div>
                
                <div className="profit-info">
                    <span className="profit-label">Lucro:</span>
                    <span className="profit-value">{surebet.profit || 'N/A'}%</span>
                </div>
            </div>
        </div>
    )
}

/**
 * Exemplo de uso simples
 */
export function createSurebetCard(surebetData) {
    const card = new SurebetCard(surebetData)
    return card.render()
}

/**
 * Exemplo de dados de teste
 */
export const exampleSurebetData = {
    sport: 'Futebol',
    event: 'Brasil vs Argentina',
    market: 'AH1(-1)',
    bookmaker1: 'Bet365',
    odd1: '1.85',
    bookmaker2: 'William Hill',
    odd2: '2.10',
    profit: '5.2'
}

// Exemplo de uso:
/*
// Importar e usar
import { createSurebetCard, exampleSurebetData } from './surebet-card-example.js'

// Criar um card
const cardHTML = createSurebetCard(exampleSurebetData)
document.getElementById('surebets-container').innerHTML = cardHTML

// Ou usar diretamente as funções de tradução
import { formatMarketForDisplay } from './market-translations.js'
const translated = formatMarketForDisplay('AH1(-1)')
console.log(translated) // "Handicap Asiático - Casa (-1)"
*/
