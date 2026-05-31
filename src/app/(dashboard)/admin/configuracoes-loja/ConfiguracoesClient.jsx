'use client'

import { useLoja } from "@/hooks/useLoja.js";
import { useCardapio } from "@/hooks/useCardapio.js"; // Reaproveitando a lógica que zera tudo
import { Store, RefreshCw, Power, AlertTriangle } from "lucide-react";
import styles from "./ConfiguracoesClient.module.css";

export default function ConfiguracoesClient() {
    const { statusLoja, loading: loadingLoja, alterarStatus, atualizando, carregarStatus } = useLoja();
    const { handleZerarCardapio, loading: loadingCardapio } = useCardapio();

    // Aguarda o carregamento de ambos os hooks
    if (loadingLoja || loadingCardapio) {
        return (
            <div className={styles.loadingContainer}>
                <RefreshCw className={styles.spin} size={40} />
                <p>Sincronizando sistema...</p>
            </div>
        );
    }

    const acionarEncerramento = async () => {
        const sucesso = await handleZerarCardapio();
        // A página recarrega para atualizar o status do toggle automaticamente
        // caso o zerarCardapioDiario no backend também altere a loja para fechada

        if (sucesso) {
            // Recarrega o status da loja para garantir que o toggle esteja atualizado
            await carregarStatus();
        }
    };

    return (
        <div className={styles.wrapper}>

            {/* CARD 1: CONTROLE DE FUNCIONAMENTO (TOGGLE) */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <Store size={22} className={styles.iconeNormal} />
                    <h2 className={styles.h2}>Status Operacional</h2>
                </div>

                <div className={styles.cardBody}>
                    <div className={styles.infoBlock}>
                        <h3>Loja no Aplicativo</h3>
                        <p>Controle se os clientes podem ou não fazer pedidos através da vitrine neste exato momento.</p>
                    </div>

                    <div className={styles.toggleWrapper}>
                        <label className={styles.switch}>
                            <input
                                type="checkbox"
                                checked={statusLoja}
                                onChange={alterarStatus}
                                disabled={atualizando}
                            />
                            <span className={styles.slider}></span>
                        </label>
                        <span className={statusLoja ? styles.textoAberto : styles.textoFechado}>
                            {atualizando ? "Sincronizando..." : (statusLoja ? "Loja Aberta" : "Loja Fechada")}
                        </span>
                    </div>
                </div>
            </div>

            {/* CARD 2: ZONA DE PERIGO (BOTÃO DE ENCERRAR) */}
            <div className={styles.cardDanger}>
                <div className={styles.cardHeaderDanger}>
                    <AlertTriangle size={22} className={styles.iconeDanger} />
                    <h2>Fim de Expediente</h2>
                </div>

                <div className={styles.cardBodyDanger}>
                    <div className={styles.infoBlock}>
                        <h3 className={styles.tituloDanger}>Zerar Cardápio Diário</h3>
                        <p>Esta ação irá inativar as chaves de <b>todos os alimentos</b> de uma só vez. Utilize apenas quando a cozinha encerrar a produção do dia.</p>
                    </div>

                    <button
                        onClick={acionarEncerramento}
                        className={styles.btnZerar}
                        disabled={atualizando}
                    >
                        <Power size={20} />
                        Encerrar Expediente
                    </button>
                </div>
            </div>

        </div>
    );
}