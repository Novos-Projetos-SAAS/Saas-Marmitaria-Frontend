import qz from "qz-tray";
import api from "./api";
/**
 * Inicia a conexão com o software QZ Tray rodando na máquina local.
 */
const QZ_CERTIFICATE =`-----BEGIN CERTIFICATE-----
MIIDCzCCAfOgAwIBAgIULHGw06BhRCFXKNkjmioDGJ8EQsAwDQYJKoZIhvcNAQEL
BQAwFTETMBEGA1UEAwwKbG9jYWxob3N0fjAeFw0yNjA4MDYwMjM3MjZaFw0zNjA4
MDMwMjM3MjZaMBUxEzARBgNVBAMMCmxvY2FsaG9zdH4wggEiMA0GCSqGSIb3DQEB
AQUAA4IBDwAwggEKAoIBAQDDzueRwGXJk0kSYco9SETqY5PSVrgz3XgngGVl1T51
UCV97692SyDlLY0G5V8PLD9ukxnUAOYxVR8D3vOfxiQzDTIs2f9ljem8rYjj/baZ
8uQkP9b2L6qQSH220VXS3nbc6GZD3ZSIOrsZcXvYXwxoZ7IvstL+ZPVw9xS+EAM4
QfIroN1MN3N6EVl1ylMTAe52OhzmtBQ12nIVN5/w41B4RppefBjXNW6LH2Ggxuhy
n1oTevj+8jYdlJNkfOuss+vlWAE8CvtVkCHTJ03O+t3jKsFy9ukgkKHWK6JPEwoo
MAS4D6vypIDRAGwh4tWfZ4pEvm4gMnFAmuwXDNoV6S/fAgMBAAGjUzBRMB0GA1Ud
DgQWBBTlPFZt0zfMej1RxFof6JmHg12omjAfBgNVHSMEGDAWgBTlPFZt0zfMej1R
xFof6JmHg12omjAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQAC
uyNONb0IerwV/9f9lwNWbiinjwHe9hX1IaBi7j/2CZs00Ayi29BuqDMPv+Tlp1Hm
nNOoOnGlzGc1IyBYXYS90CSSv5yfgIWvHv/hfmgSqRm+GhWP/ZuPe14LBGi+f+eE
BPK3bOHTSXwIfwhXmPQ2R5VimK/1uoaTqE1YAvF2rcWSOM/ec4ixK1DPeZvjT3Lq
PClTw4ZzOqxfitSRMphqojbLvZ3shkw4TLQD79DsEYlPr/7FBBlnbGqMXLtAvKXO
U9kUF2r7Bl9zSWNypv+8gbVdhz2/OScH7RI6f2QdapqoIhjumqWpK1oEg4pFticZ
007iJ8MvB6ScJdKTfxyt
-----END CERTIFICATE-----`


// 2. Apresenta o "Crachá" (Certificado) para o QZ Tray
qz.security.setCertificatePromise((resolve, reject) => {
    resolve(QZ_CERTIFICATE);
});

// 3. Pede para o Backend carimbar a requisição usando a chave privada
qz.security.setSignaturePromise((toSign) => {
    return function(resolve, reject) {
        // 👇 Bate exatamente na rota que acabamos de criar no Backend
        api.post('/qz/assinar', { request: toSign })
            .then(response => {
                resolve(response.data); // O backend devolve a assinatura, e o QZ Tray libera!
            })
            .catch(err => {
                console.error("Erro ao solicitar assinatura do Backend:", err);
                reject(err);
            });
    };
});

export const conectarQZ = async () => {
    try {
        if (!qz.websocket.isActive()) {
            await qz.websocket.connect();
            console.log("✅ QZ Tray conectado com sucesso!");
        }
    } catch (error) {
        console.error("❌ Erro ao conectar no QZ Tray:", error);
        throw new Error("Não foi possível conectar ao QZ Tray. Verifique se ele está aberto e rodando perto do relógio do Windows.");
    }
};

/**
 * Desconecta o WebSocket (útil para limpezas, se necessário)
 */
export const desconectarQZ = async () => {
    if (qz.websocket.isActive()) {
        await qz.websocket.disconnect();
    }
};

/**
 * Recebe o HTML puro do cupom e o nome da impressora para disparar a impressão.
 * 
 * @param {string} conteudoHTML - O HTML gerado a partir do seu componente React
 * @param {string} nomeImpressora - O nome exato da impressora cadastrada no Windows
 */
export const imprimirCupom = async (conteudoHTML, nomeImpressora) => {
    try {
        // 1. Garante que o QZ Tray está conectado
        await conectarQZ();

        // 2. Busca a impressora exata pelo nome que você salvou nas configurações
        const impressora = await qz.printers.find(nomeImpressora);
        
        // 3. Configura a página (Sem margens para bobina térmica)
        const config = qz.configs.create(impressora, {
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
            // Evita que o Windows tente redimensionar e borrar o texto
            scaleContent: false 
        });

        // 4. Monta o pacote de dados dizendo que é um HTML
        const data = [
            {
                type: 'html',
                format: 'plain',
                data: conteudoHTML
            }
        ];

        // 5. Dispara a impressão!
        await qz.print(config, data);
        console.log(`🖨️ Impressão enviada com sucesso para: ${impressora}`);
        
        return true;
    } catch (error) {
        console.error("❌ Erro na impressão automática:", error);
        throw error;
    }
};