import qz from "qz-tray";

/**
 * Inicia a conexão com o software QZ Tray rodando na máquina local.
 */
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