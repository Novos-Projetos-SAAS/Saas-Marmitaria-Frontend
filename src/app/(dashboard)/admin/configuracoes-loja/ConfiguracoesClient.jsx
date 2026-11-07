"use client";

import { useState } from 'react';
import { useAuthContext } from '@/context/AuthContext.js';
import { useLoja } from '@/hooks/useLoja.js';
import { useCardapio } from '@/hooks/useCardapio.js';
import { Store, RefreshCw, Power, AlertTriangle, Building2, Settings, CreditCard } from 'lucide-react';
import Can from '@/components/ui/can/index.jsx';
import EmpresaForm from '@/components/forms/empresa/empresaForm.jsx';
import InfinitepayConfiguration from '@/components/InfinitepayConfiguration/InfinitepayConfiguration.jsx';
import styles from './ConfiguracoesClient.module.css';

export default function ConfiguracoesClient() {
    const { hasPermission, isReady } = useAuthContext();
    const abasPermitidas = [
        hasPermission('loja.configurar') && 'operacional',
        hasPermission('empresa.configurar') && 'empresa',
        (hasPermission('pagamentos.configurar') || hasPermission('pagamentos.ativar')) && 'infinitepay'
    ].filter(Boolean);
    const [abaSelecionada, setAbaAtiva] = useState(() => abasPermitidas[0]);
    const abaAtiva = abasPermitidas.includes(abaSelecionada) ? abaSelecionada : abasPermitidas[0];

    if (!isReady) return null;
    return <div className={styles.wrapper}>
        <div className={styles.tabs}>
            <Can perform="loja.configurar">
                <button type="button" className={`${styles.tabBtn} ${abaAtiva === 'operacional' ? styles.tabAtiva : ''}`} onClick={() => setAbaAtiva('operacional')}>
                    <Settings size={18} aria-hidden="true" /> Operacional
                </button>
            </Can>
            <Can perform="empresa.configurar">
                <button type="button" className={`${styles.tabBtn} ${abaAtiva === 'empresa' ? styles.tabAtiva : ''}`} onClick={() => setAbaAtiva('empresa')}>
                    <Building2 size={18} aria-hidden="true" /> Dados da Empresa
                </button>
            </Can>
            <Can perform={['pagamentos.configurar', 'pagamentos.ativar']}>
                <button type="button" className={`${styles.tabBtn} ${abaAtiva === 'infinitepay' ? styles.tabAtiva : ''}`} onClick={() => setAbaAtiva('infinitepay')}>
                    <CreditCard size={18} aria-hidden="true" /> InfinitePay
                </button>
            </Can>
        </div>
        {abaAtiva === 'operacional' && <OperationalSettings />}
        {abaAtiva === 'empresa' && <div className={styles.abaContent}><EmpresaForm /></div>}
        {abaAtiva === 'infinitepay' && <InfinitepayConfiguration />}
    </div>;
}

function OperationalSettings() {
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
    );
}
