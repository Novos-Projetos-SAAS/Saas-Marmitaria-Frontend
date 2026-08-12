import qz from "qz-tray";
import api from "./api";

// Função para buscar e formatar o certificado público
const getQzCertificate = () => {
    const rawCert = process.env.NEXT_PUBLIC_QZ_CERTIFICATE;
    
    if (!rawCert) {
        console.warn("Aviso: Certificado QZ Tray não encontrado nas variáveis de ambiente.");
        return "";
    }

    return rawCert.replace(/\\n/g, '\n');
};

// 2. Apresenta o "Crachá" (Certificado) para o QZ Tray
qz.security.setCertificatePromise((resolve, reject) => {
    try {
        const certificate = getQzCertificate();
        resolve(certificate);
    } catch (error) {
        reject(error);
    }
});

qz.security.setSignatureAlgorithm("SHA512");

// 3. Pede para o Backend carimbar a requisição usando a chave privada
qz.security.setSignaturePromise((toSign) => {
    return function (resolve, reject) {
        // Bate exatamente na rota do Backend
        api.post('/qz/assinar', { request: toSign })
            .then(response => {
                resolve(response.data); 
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

export const desconectarQZ = async () => {
    if (qz.websocket.isActive()) {
        await qz.websocket.disconnect();
    }
};

export const imprimirCupom = async (conteudoHTML, nomeImpressora) => {
    try {
        await conectarQZ();

        if (!conteudoHTML) {
            throw new Error('Conteúdo do cupom não informado.');
        }

        if (!nomeImpressora) {
            throw new Error('Nome da impressora não informado.');
        }

        const impressora = await qz.printers.find(nomeImpressora);

        if (!impressora) {
            throw new Error(`Impressora "${nomeImpressora}" não encontrada.`);
        }

        const config = qz.configs.create(impressora, {
            units: 'mm',
            margins: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            },
            orientation: 'portrait',
            scaleContent: false
        });

        const documentoHTML = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                </head>
                <body style="width:58mm;margin:0;padding:0;background:#ffffff;">
                    ${conteudoHTML}
                </body>
            </html>
        `;

        const data = [
            {
                type: 'pixel',
                format: 'html',
                flavor: 'plain',
                data: documentoHTML
            }
        ];

        await qz.print(config, data);

        console.log(`🖨️ Impressão enviada com sucesso para: ${impressora}`);

        return true;
    } catch (error) {
        console.error('❌ Erro na impressão automática:', error);
        throw error;
    }
};