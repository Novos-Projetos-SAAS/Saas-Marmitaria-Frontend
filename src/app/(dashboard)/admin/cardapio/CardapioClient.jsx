// 'use client'

// import { useCardapioClient } from "@/hooks/useCardapio.js";
// import Can from "@/components/ui/can";
// import { Power, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
// import styles from "./CardapioClient.module.css";

// export default function CardapioClient() {
//     const { cardapioAgrupado, loading, handleToggle, handleZerarCardapio } = useCardapioClient();

//     if (loading) {
//         return (
//             <div className={styles.loadingContainer}>
//                 <RefreshCw className={styles.spin} size={40} />
//                 <p>Montando painel da cozinha...</p>
//             </div>
//         );
//     }

//     const categorias = Object.keys(cardapioAgrupado);

//     return (
//         <div className={styles.wrapper}>
            
//             {/* Header de Ações (Botão Fechar Loja) */}
//             <div className={styles.actionsBar}>
//                 <div className={styles.infoText}>
//                     <p>Ative os itens que serão preparados e vendidos hoje.</p>
//                 </div>
                
//                 <Can perform="cardapio.zerar">
//                     <button onClick={handleZerarCardapio} className={styles.btnZerar}>
//                         <Power size={20} />
//                         Encerrar Expediente
//                     </button>
//                 </Can>
//             </div>

//             {/* Grid de Categorias */}
//             {categorias.length === 0 ? (
//                 <div className={styles.emptyState}>Nenhum alimento cadastrado e ativo no sistema.</div>
//             ) : (
//                 <div className={styles.gridCategorias}>
//                     {categorias.map(categoria => (
//                         <div key={categoria} className={styles.categoriaCard}>
//                             <h2 className={styles.categoriaTitle}>{categoria}</h2>
                            
//                             <div className={styles.listaAlimentos}>
//                                 {cardapioAgrupado[categoria].map(alimento => {
//                                     const disponivel = alimento.disponivel_hoje === 1 || alimento.disponivel_hoje === true;
                                    
//                                     return (
//                                         <div key={alimento.id} className={`${styles.alimentoItem} ${disponivel ? styles.ativo : ''}`}>
//                                             <div className={styles.alimentoInfo}>
//                                                 <span className={styles.alimentoNome}>{alimento.nome}</span>
//                                                 {disponivel ? (
//                                                     <span className={styles.badgeAtivo}><CheckCircle2 size={12} /> Hoje tem</span>
//                                                 ) : (
//                                                     <span className={styles.badgeInativo}><XCircle size={12} /> Indisponível</span>
//                                                 )}
//                                             </div>

//                                             {/* O Toggle Switch Bonitão */}
//                                             <label className={styles.switch}>
//                                                 <input
//                                                     type="checkbox"
//                                                     checked={disponivel}
//                                                     onChange={() => handleToggle(alimento.id, disponivel)}
//                                                 />
//                                                 <span className={styles.slider}></span>
//                                             </label>
//                                         </div>
//                                     )
//                                 })}
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// }


'use client'

import { useCardapio } from "@/hooks/useCardapio.js";
import Can from "@/components/ui/can";
import { Power, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import styles from "./CardapioClient.module.css";

export default function CardapioClient() {
    const { cardapioAgrupado, loading, handleToggle, handleZerarCardapio } = useCardapio();

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <RefreshCw className={styles.spin} size={40} />
                <p>Montando painel da cozinha...</p>
            </div>
        );
    }

    const categorias = Object.keys(cardapioAgrupado);

    return (
        <div className={styles.wrapper}>
            
            <div className={styles.actionsBar}>
                <div className={styles.infoText}>
                    <p>Ative as chaves para disponibilizar os alimentos no aplicativo hoje.</p>
                </div>
                
                <Can perform="cardapio.gerenciar">
                    <button onClick={handleZerarCardapio} className={styles.btnZerar}>
                        <Power size={20} />
                        Encerrar Expediente
                    </button>
                </Can>
            </div>

            {categorias.length === 0 ? (
                <div className={styles.emptyState}>Nenhum alimento cadastrado.</div>
            ) : (
                <div className={styles.gridCategorias}>
                    {categorias.map(categoria => (
                        <div key={categoria} className={styles.categoriaCard}>
                            <h2 className={styles.categoriaTitle}>{categoria}</h2>
                            
                            <div className={styles.listaAlimentos}>
                                {cardapioAgrupado[categoria].map(alimento => {
                                    // Verifica se tá true ou 1
                                    const disponivel = alimento.disponivel_hoje === 1 || alimento.disponivel_hoje === true;
                                    
                                    return (
                                        <div key={alimento.id} className={`${styles.alimentoItem} ${disponivel ? styles.ativo : ''}`}>
                                            <div className={styles.alimentoInfo}>
                                                <span className={styles.alimentoNome}>{alimento.nome}</span>
                                                {disponivel ? (
                                                    <span className={styles.badgeAtivo}><CheckCircle2 size={12} /> Disponível</span>
                                                ) : (
                                                    <span className={styles.badgeInativo}><XCircle size={12} /> Desligado</span>
                                                )}
                                            </div>

                                            <label className={styles.switch}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={disponivel}
                                                    onChange={() => handleToggle(alimento.id, disponivel)}
                                                />
                                                <span className={styles.slider}></span>
                                            </label>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}