import qz from "qz-tray";
import api from "./api";
/**
 * Inicia a conexão com o software QZ Tray rodando na máquina local.
 */
const QZ_CERTIFICATE =`
-----BEGIN CERTIFICATE-----
MIIDCzCCAfOgAwIBAgIUOZykub8V03ZmHl65FiZmiRJx9QgwDQYJKoZIhvcNAQEL
BQAwFTETMBEGA1UEAwwKTWFybWl0YXJpYTAeFw0yNjA4MDYwMzI5NDFaFw0zNjA4
MDMwMzI5NDFaMBUxEzARBgNVBAMMCk1hcm1pdGFyaWEwggEiMA0GCSqGSIb3DQEB
AQUAA4IBDwAwggEKAoIBAQCfIxw97yAsr4o0pAcoWyPJZTHyYs95Zi4bojn2J5Vx
nZPFj/zJ+uS3g4rQxaxl8Tiu0LbbEjBns+Jiw5L6xchSmG4Ak8XbngGfDMN6tgaJ
rdDu8oT32ELtBIgXUYC1Cw6HQVQS7qCs+At3nG0UyEyM+iCo3/1HyyjXwgaWw8P0
OnAUAGkFlTlLignMZieCblnIMlfppNHeCn6K1p5tJNLaW+n192IQDZuQFCuTxQtW
Gveb/FueUc68S6i1qFsUNRanOTagtgwa6qYnaVGNGohtPyN+CSLG5H7EcIaGi8Vh
Xidn1j7OdGkMc4T6Zie4YvuASJ59q4A0A1uGXCW2afBZAgMBAAGjUzBRMB0GA1Ud
DgQWBBTXKGDWkQ5u4eZNsMzszKnExWLSqDAfBgNVHSMEGDAWgBTXKGDWkQ5u4eZN
sMzszKnExWLSqDAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQBP
6RjvlzTpziwkvABUDV+2Vt80xzZ4QwugIeRAvsi3hB9KwOKol1ywvOw2hu8tcCTe
ANEwSqUNuvtpR+RTTOdPCVrXRyGT+1OHJXOHZmQ9WLZg7Xn7HEG6zNN683FBbgjV
9IpHpi6qin4m3TcMvlVuETRTM2OA5J4aNZfHncfo3qfNHHtfjMU/uiiZ0U/Y/glI
Chv92iiSGBUrxTF29xfQd6Uj0vIOC9xKrom2RzJnK77auqE+2uUVGePvdNcwJzj+
jh7bnjbm+uZnynK031bYTQQq8JUe8TQEozdvKAZ8b1Loyi1lM0koPAZ7kN7i4EhI
OmtxVNtMgIrJgQFDpf5/
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