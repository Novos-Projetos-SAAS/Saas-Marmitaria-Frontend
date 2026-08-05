// 'use client'

// import { useLoja } from "@/hooks/useLoja.js";
// import { useCardapio } from "@/hooks/useCardapio.js"; // Reaproveitando a lógica que zera tudo
// import { Store, RefreshCw, Power, AlertTriangle } from "lucide-react";
// import styles from "./ConfiguracoesClient.module.css";

// export const metadata = {
//     title: "Marmitaria | Configurações", // Ajuste para o nome do seu sistema
//     description: "Módulo de configurações da Marmitaria",
// };

// export default function ConfiguracoesClient() {
//     const { statusLoja, loading: loadingLoja, alterarStatus, atualizando, carregarStatus } = useLoja();
//     const { handleZerarCardapio, loading: loadingCardapio } = useCardapio();

//     // Aguarda o carregamento de ambos os hooks
//     if (loadingLoja || loadingCardapio) {
//         return (
//             <div className={styles.loadingContainer}>
//                 <RefreshCw className={styles.spin} size={40} />
//                 <p>Sincronizando sistema...</p>
//             </div>
//         );
//     }

//     const acionarEncerramento = async () => {
//         const sucesso = await handleZerarCardapio();
//         // A página recarrega para atualizar o status do toggle automaticamente
//         // caso o zerarCardapioDiario no backend também altere a loja para fechada

//         if (sucesso) {
//             // Recarrega o status da loja para garantir que o toggle esteja atualizado
//             await carregarStatus();
//         }
//     };

//     return (
//         <div className={styles.wrapper}>

//             {/* CARD 1: CONTROLE DE FUNCIONAMENTO (TOGGLE) */}
//             <div className={styles.card}>
//                 <div className={styles.cardHeader}>
//                     <Store size={22} className={styles.iconeNormal} />
//                     <h2 className={styles.h2}>Status Operacional</h2>
//                 </div>

//                 <div className={styles.cardBody}>
//                     <div className={styles.infoBlock}>
//                         <h3>Loja no Aplicativo</h3>
//                         <p>Controle se os clientes podem ou não fazer pedidos através da vitrine neste exato momento.</p>
//                     </div>

//                     <div className={styles.toggleWrapper}>
//                         <label className={styles.switch}>
//                             <input
//                                 type="checkbox"
//                                 checked={statusLoja}
//                                 onChange={alterarStatus}
//                                 disabled={atualizando}
//                             />
//                             <span className={styles.slider}></span>
//                         </label>
//                         <span className={statusLoja ? styles.textoAberto : styles.textoFechado}>
//                             {atualizando ? "Sincronizando..." : (statusLoja ? "Loja Aberta" : "Loja Fechada")}
//                         </span>
//                     </div>
//                 </div>
//             </div>

//             {/* CARD 2: ZONA DE PERIGO (BOTÃO DE ENCERRAR) */}
//             <div className={styles.cardDanger}>
//                 <div className={styles.cardHeaderDanger}>
//                     <AlertTriangle size={22} className={styles.iconeDanger} />
//                     <h2>Fim de Expediente</h2>
//                 </div>

//                 <div className={styles.cardBodyDanger}>
//                     <div className={styles.infoBlock}>
//                         <h3 className={styles.tituloDanger}>Zerar Cardápio Diário</h3>
//                         <p>Esta ação irá inativar as chaves de <b>todos os alimentos</b> de uma só vez. Utilize apenas quando a cozinha encerrar a produção do dia.</p>
//                     </div>

//                     <button
//                         onClick={acionarEncerramento}
//                         className={styles.btnZerar}
//                         disabled={atualizando}
//                     >
//                         <Power size={20} />
//                         Encerrar Expediente
//                     </button>
//                 </div>
//             </div>

//         </div>
//     );
// }

'use client'

import { useState } from "react";
import { useLoja } from "@/hooks/useLoja.js";
import { useCardapio } from "@/hooks/useCardapio.js"; 
import { Store, RefreshCw, Power, AlertTriangle, Building2, Settings } from "lucide-react";
import Can from "@/components/ui/can/index.jsx"; // Ajuste o caminho se necessário
import EmpresaForm from "@/components/forms/empresa/empresaForm.jsx"; // Ajuste o caminho se necessário
import styles from "./ConfiguracoesClient.module.css";

export const metadata = {
    title: "Marmitaria | Configurações", 
    description: "Módulo de configurações da Marmitaria",
};

export default function ConfiguracoesClient() {
    // 👇 Estado para controlar as abas
    const [abaAtiva, setAbaAtiva] = useState('operacional');

    const { statusLoja, loading: loadingLoja, alterarStatus, atualizando, carregarStatus } = useLoja();
    const { handleZerarCardapio, loading: loadingCardapio } = useCardapio();

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
        if (sucesso) {
            await carregarStatus();
        }
    };

    return (
        <div className={styles.wrapper}>
            
            {/* 👇 SISTEMA DE ABAS */}
            <div className={styles.tabs}>
                <button 
                    className={`${styles.tabBtn} ${abaAtiva === 'operacional' ? styles.tabAtiva : ''}`} 
                    onClick={() => setAbaAtiva('operacional')}
                >
                    <Settings size={18} /> Operacional
                </button>

                <Can perform="empresa.configurar">
                    <button 
                        className={`${styles.tabBtn} ${abaAtiva === 'empresa' ? styles.tabAtiva : ''}`} 
                        onClick={() => setAbaAtiva('empresa')}
                    >
                        <Building2 size={18} /> Dados da Empresa
                    </button>
                </Can>
            </div>

            {/* 👇 CONTEÚDO DA ABA OPERACIONAL (Seus cards originais) */}
            {abaAtiva === 'operacional' && (
                <div className={styles.abaContent}>
                    {/* CARD 1: CONTROLE DE FUNCIONAMENTO */}
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

                    {/* CARD 2: ZONA DE PERIGO */}
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
            )}

            {/* 👇 CONTEÚDO DA ABA EMPRESA (O novo formulário) */}
            {abaAtiva === 'empresa' && (
                <div className={styles.abaContent}>
                    <EmpresaForm />
                </div>
            )}

        </div>
    );
}