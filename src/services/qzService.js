// import qz from "qz-tray";
// import api from "./api";
// /**
//  * Inicia a conexão com o software QZ Tray rodando na máquina local.
//  */
// const QZ_CERTIFICATE = `-----BEGIN CERTIFICATE-----
// MIIECzCCAvOgAwIBAgIGAZ/VMIXyMA0GCSqGSIb3DQEBCwUAMIGiMQswCQYDVQQG
// EwJVUzELMAkGA1UECAwCTlkxEjAQBgNVBAcMCUNhbmFzdG90YTEbMBkGA1UECgwS
// UVogSW5kdXN0cmllcywgTExDMRswGQYDVQQLDBJRWiBJbmR1c3RyaWVzLCBMTEMx
// HDAaBgkqhkiG9w0BCQEWDXN1cHBvcnRAcXouaW8xGjAYBgNVBAMMEVFaIFRyYXkg
// RGVtbyBDZXJ0MB4XDTI2MDgwNTAzNDkxNFoXDTQ2MDgwNTAzNDkxNFowgaIxCzAJ
// BgNVBAYTAlVTMQswCQYDVQQIDAJOWTESMBAGA1UEBwwJQ2FuYXN0b3RhMRswGQYD
// VQQKDBJRWiBJbmR1c3RyaWVzLCBMTEMxGzAZBgNVBAsMElFaIEluZHVzdHJpZXMs
// IExMQzEcMBoGCSqGSIb3DQEJARYNc3VwcG9ydEBxei5pbzEaMBgGA1UEAwwRUVog
// VHJheSBEZW1vIENlcnQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDT
// 2Oc0rgK733lePWS2juLDzzwTcH9NMI8cidBreiAllbKZGH/1TXnF+OtVj/mAPFEu
// fdtiRluTcVYsGPPbiMO1RYdOGcSVS/692GTLtlGgOsykJZ1YfCxOFWiBY1Y7J8en
// U7mFNw9EOAhYYgjfaX3X2/vYCRsqSgLwWnvlxQr8q68QpA06yADSUEo6wu2rV2Ua
// ithz713B4A3XoQ3tZ2neou7HnY/OFuWiy3/VX9MiKbODY1AnDelnggkY8ZO+mPv+
// ty7410kLfCJ1cf6w2NrunDaRJ1Ud8RVroLraY4W/Wm/UXCRTyRduzCJGGmGYd8QZ
// za5PaKoFZZ1iIFHH1cQ7AgMBAAGjRTBDMBIGA1UdEwEB/wQIMAYBAf8CAQEwDgYD
// VR0PAQH/BAQDAgEGMB0GA1UdDgQWBBTPa5lNEdHaA3svfEgLVR+Jka+NVjANBgkq
// hkiG9w0BAQsFAAOCAQEAiM2I98In8JlAnw/71EOYwjoRGkA89sOuNZQcfXKRV6Ul
// hlVwkFFa5fC0fXFAdlH3Q7ty1qNbVfMnI1L5+UihOiY5qgBBiKDBcRECvMqk4bUH
// uGJ/4MqIW/clIShhCd/DAZnm2LcbcXZ1GBd/66YctmX9f3pm12hq7vKU4rFNjX3I
// QytSqWlbynrqgfn0yIovgpLhWj3jtLkVVBr9tHknoGBTo1+8O17x64lbTBDyINfh
// zoIqKpGEqzrbMWPYA06Y73R5SGNn3sUEbS4xi7tpGWync3wFI0k4+eya+eMxdEG8
// 2Yx6zxCIKTDubcNnJz+FrPQRc5EyQr6OOIeB0QeMqg==
// -----END CERTIFICATE-----`


// // 2. Apresenta o "Crachá" (Certificado) para o QZ Tray
// qz.security.setCertificatePromise((resolve, reject) => {
//     resolve(QZ_CERTIFICATE);
// });

// qz.security.setSignatureAlgorithm("SHA512");

// // 3. Pede para o Backend carimbar a requisição usando a chave privada
// qz.security.setSignaturePromise((toSign) => {
//     return function (resolve, reject) {
//         // 👇 Bate exatamente na rota que acabamos de criar no Backend
//         api.post('/qz/assinar', { request: toSign })
//             .then(response => {
//                 resolve(response.data); // O backend devolve a assinatura, e o QZ Tray libera!
//             })
//             .catch(err => {
//                 console.error("Erro ao solicitar assinatura do Backend:", err);
//                 reject(err);
//             });
//     };
// });

// export const conectarQZ = async () => {
//     try {
//         if (!qz.websocket.isActive()) {
//             await qz.websocket.connect();
//             console.log("✅ QZ Tray conectado com sucesso!");
//         }
//     } catch (error) {
//         console.error("❌ Erro ao conectar no QZ Tray:", error);
//         throw new Error("Não foi possível conectar ao QZ Tray. Verifique se ele está aberto e rodando perto do relógio do Windows.");
//     }
// };

// /**
//  * Desconecta o WebSocket (útil para limpezas, se necessário)
//  */
// export const desconectarQZ = async () => {
//     if (qz.websocket.isActive()) {
//         await qz.websocket.disconnect();
//     }
// };

// /**
//  * Recebe o HTML puro do cupom e o nome da impressora para disparar a impressão.
//  * 
//  * @param {string} conteudoHTML - O HTML gerado a partir do seu componente React
//  * @param {string} nomeImpressora - O nome exato da impressora cadastrada no Windows
//  */
// export const imprimirCupom = async (conteudoHTML, nomeImpressora) => {
//     try {
//         await conectarQZ();

//         if (!conteudoHTML) {
//             throw new Error('Conteúdo do cupom não informado.');
//         }

//         if (!nomeImpressora) {
//             throw new Error('Nome da impressora não informado.');
//         }

//         const impressora = await qz.printers.find(nomeImpressora);

//         if (!impressora) {
//             throw new Error(`Impressora "${nomeImpressora}" não encontrada.`);
//         }

//         const config = qz.configs.create(impressora, {
//             units: 'mm',
//             margins: {
//                 top: 0,
//                 right: 0,
//                 bottom: 0,
//                 left: 0
//             },
//             orientation: 'portrait',
//             scaleContent: false
//         });

//         const documentoHTML = `
//             <!DOCTYPE html>
//             <html>
//                 <head>
//                     <meta charset="UTF-8">
//                 </head>

//                 <body style="width:58mm;margin:0;padding:0;background:#ffffff;">
//                     ${conteudoHTML}
//                 </body>
//             </html>
//         `;

//         const data = [
//             {
//                 type: 'pixel',
//                 format: 'html',
//                 flavor: 'plain',
//                 data: documentoHTML
//             }
//         ];

//         await qz.print(config, data);

//         console.log(`🖨️ Impressão enviada com sucesso para: ${impressora}`);

//         return true;
//     } catch (error) {
//         console.error('❌ Erro na impressão automática:', error);
//         throw error;
//     }
// };


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