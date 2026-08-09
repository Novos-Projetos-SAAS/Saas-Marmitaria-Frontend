// 'use client'

// import { useRouter } from 'next/navigation';

// import { useState, useEffect } from 'react';

// import { usePedidos } from '@/hooks/usePedidos';

// import { Clock, ChefHat, Bike, CheckCircle2, Search, ArrowLeft, Package, Store, XCircle } from 'lucide-react';

// import styles from './page.module.css';

// export default function AcompanharPedido() {
//     const router = useRouter();
//     const [telefone, setTelefone] = useState('');

//     // 👇 Mudamos para um Array vazio ao invés de null
//     const [pedidos, setPedidos] = useState([]);
//     const [erro, setErro] = useState('');

//     const { buscarPedidoPorTelefoneUsuario, buscando } = usePedidos();

//     const fazerBusca = async (telefone) => {
//         setErro('');
//         const response = await buscarPedidoPorTelefoneUsuario(telefone);

//         if (response && response.status === 'success' && response.data.length > 0) {
//             // 👇 Agora salvamos TODOS os pedidos retornados na lista
//             setPedidos(response.data);
//         } else {
//             setPedidos([]);
//             setErro('Nenhum pedido encontrado para este telefone.');
//         }
//     };
//     useEffect(() => {
//         setTimeout(() => {
//             const telefoneSalvo = localStorage.getItem('marmitaria_telefone_cliente');
//             if (telefoneSalvo) {
//                 setTelefone(telefoneSalvo);
//                 fazerBusca(telefoneSalvo);
//             }
//         }, 0);

//     }, []);


//     const handleBusca = (e) => {
//         e.preventDefault();
//         fazerBusca(telefone);
//     };

//     const getStatusIndex = (statusAtual) => {
//         if (!statusAtual) return -1;
//         const s = statusAtual.toLowerCase();

//         if (s === 'pendente') return 0;
//         if (s === 'em preparo') return 1;
//         // O passo 2 pode ser tanto entrega quanto retirada
//         if (s === 'saiu para entrega' || s === 'pronto para retirada') return 2;
//         if (s === 'entregue') return 3;

//         // Cancelado não tem índice na linha do tempo normal
//         return -1;
//     };

//     // Função para definir a cor da etiqueta (badge) baseado no status
//     const getBadgeClass = (statusAtual) => {
//         if (!statusAtual) return styles.badgeDefault;
//         const s = statusAtual.toLowerCase();

//         if (s === 'pendente') return styles.badgePendente;
//         if (s === 'em preparo') return styles.badgePreparo;
//         if (s === 'pronto para retirada') return styles.badgeRetirada;
//         if (s === 'saiu para entrega') return styles.badgeEntrega;
//         if (s === 'entregue') return styles.badgeEntregue;
//         if (s === 'cancelado') return styles.badgeCancelado;

//         return styles.badgeDefault;
//     };

//     const formatarHora = (dataIso) => {
//         return new Date(dataIso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
//     };

//     const formatarData = (dataIso) => {
//         return new Date(dataIso).toLocaleDateString('pt-BR');
//     };

//     return (
//         <main className={styles.container}>
//             <header className={styles.header}>
//                 <button onClick={() => router.push('/')} className={styles.btnVoltar}>
//                     <ArrowLeft size={20} />
//                 </button>
//                 <h1>Meus Pedidos</h1>
//             </header>

//             <form onSubmit={handleBusca} className={styles.buscaForm}>
//                 <input
//                     type="tel"
//                     placeholder="Digite seu número de telefone"
//                     value={telefone}
//                     onChange={(e) => setTelefone(e.target.value)}
//                     className={styles.inputBusca}
//                 />
//                 <button type="submit" className={styles.btnBuscar} disabled={buscando}>
//                     {buscando ? <Clock className={styles.spin} size={20} /> : <Search size={20} />}
//                 </button>
//             </form>

//             {erro && <p className={styles.erro}>{erro}</p>}

//             {buscando && pedidos.length === 0 && <div className={styles.loading}>Consultando a cozinha...</div>}

//             {pedidos.length > 0 && !buscando && (
//                 <div className={styles.listaPedidos}>
//                     {pedidos.map((pedido) => (
//                         <div key={pedido.id} className={styles.cardRastreio}>

//                             {/* CABEÇALHO DO CARD */}
//                             <div className={styles.cardHeader}>
//                                 <div>
//                                     <h2>Pedido #{pedido.id}</h2>
//                                     <span>{formatarData(pedido.criado_em)} às {formatarHora(pedido.criado_em)}</span>
//                                 </div>
//                                 {/* Badge colorida dinâmica */}
//                                 <div className={`${styles.badgeStatus} ${getBadgeClass(pedido.status)}`}>
//                                     {pedido.status}
//                                 </div>
//                             </div>

//                             {/* LINHA DO TEMPO / CANCELADO */}
//                             {pedido.status.toLowerCase() === 'cancelado' ? (
//                                 <div className={styles.alertaCancelado}>
//                                     <XCircle size={32} />
//                                     <p>Este pedido foi cancelado.</p>
//                                 </div>
//                             ) : (
//                                 <div className={styles.timeline}>
//                                     <EtapaTimeline icone={<Clock />} titulo="Pendente" ativo={getStatusIndex(pedido.status) >= 0} />
//                                     <div className={`${styles.linha} ${getStatusIndex(pedido.status) >= 1 ? styles.linhaAtiva : ''}`} />

//                                     <EtapaTimeline icone={<ChefHat />} titulo="Em Preparo" ativo={getStatusIndex(pedido.status) >= 1} />
//                                     <div className={`${styles.linha} ${getStatusIndex(pedido.status) >= 2 ? styles.linhaAtiva : ''}`} />

//                                     <EtapaTimeline
//                                         icone={
//                                             pedido.metodo_entrega ===
//                                                 'Retirada'

//                                                 ? <Store />

//                                                 : <Bike />
//                                         }

//                                         titulo={
//                                             pedido.metodo_entrega ===
//                                                 'Retirada'

//                                                 ? 'Pronto para Retirada'

//                                                 : 'Saiu para Entrega'
//                                         }
//                                         ativo={getStatusIndex(pedido.status) >= 2}
//                                     />
//                                     <div className={`${styles.linha} ${getStatusIndex(pedido.status) >= 3 ? styles.linhaAtiva : ''}`} />

//                                     <EtapaTimeline icone={<CheckCircle2 />} titulo="Entregue" ativo={getStatusIndex(pedido.status) >= 3} />
//                                 </div>
//                             )}

//                             {/* RESUMO DOS ITENS */}
//                             <div
//                                 className={
//                                     styles.itensResumo
//                                 }
//                             >

//                                 <h3>
//                                     Resumo do Pedido
//                                 </h3>


//                                 {/* ========================================================
//         MARMITAS
//        ======================================================== */}

//                                 {(pedido.marmitas || [])
//                                     .map(
//                                         (
//                                             marmita
//                                         ) => (

//                                             <div
//                                                 key={
//                                                     marmita.id
//                                                 }
//                                                 className={
//                                                     styles.itemMarmita
//                                                 }
//                                             >

//                                                 <strong>

//                                                     {marmita.quantidade}x{' '}

//                                                     Marmita {marmita.tamanho}

//                                                 </strong>


//                                                 <span>

//                                                     {(marmita.alimentos || [])

//                                                         .map(
//                                                             (
//                                                                 alimento
//                                                             ) =>

//                                                                 typeof alimento ===
//                                                                     'string'

//                                                                     ? alimento

//                                                                     : alimento.nome
//                                                         )

//                                                         .join(
//                                                             ', '
//                                                         )}

//                                                 </span>

//                                             </div>
//                                         )
//                                     )}


//                                 {/* ========================================================
//         PRODUTOS
//        ======================================================== */}

//                                 {(pedido.produtos || [])
//                                     .map(
//                                         (
//                                             produto
//                                         ) => (

//                                             <div
//                                                 key={
//                                                     produto.id
//                                                 }
//                                                 className={
//                                                     styles.itemMarmita
//                                                 }
//                                             >

//                                                 <strong>

//                                                     {produto.quantidade}x{' '}

//                                                     {produto.nome}

//                                                 </strong>


//                                                 <span>

//                                                     {produto.categoria_nome ||
//                                                         'Complemento'}

//                                                     {' • '}

//                                                     R$ {' '}

//                                                     {Number(
//                                                         produto.subtotal
//                                                     )
//                                                         .toFixed(2)
//                                                         .replace(
//                                                             '.',
//                                                             ','
//                                                         )}

//                                                 </span>

//                                             </div>
//                                         )
//                                     )}

//                             </div>

//                             {/* RODAPÉ COM TOTAL */}
//                             <div className={styles.cardFooter}>
//                                 <strong>Total:</strong>
//                                 <span>R$ {Number(pedido.valor_total).toFixed(2).replace('.', ',')}</span>
//                             </div>

//                         </div>
//                     ))}
//                 </div>
//             )}
//         </main>
//     );
// }

// // Lembre-se de manter este componente aqui no final do arquivo, fora da função principal!
// const EtapaTimeline = ({ icone, titulo, ativo }) => (
//     <div className={`${styles.etapa} ${ativo ? styles.etapaAtiva : ''}`}>
//         <div className={styles.iconeWrap}>{icone}</div>
//         <span>{titulo}</span>
//     </div>
// );


'use client'

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { usePedidos } from '@/hooks/usePedidos';
import { Clock, ChefHat, Bike, CheckCircle2, Search, ArrowLeft, Package, Store, XCircle } from 'lucide-react';

import styles from './page.module.css';

export default function AcompanharPedido() {
    const router = useRouter();
    const [telefone, setTelefone] = useState('');
    const [pedidos, setPedidos] = useState([]);
    const [erro, setErro] = useState('');

    const { buscarPedidoPorTelefoneUsuario, buscando } = usePedidos();

    const fazerBusca = async (telefoneBusca) => {
        setErro('');
        const response = await buscarPedidoPorTelefoneUsuario(telefoneBusca);

        if (response && response.status === 'success' && response.data.length > 0) {
            setPedidos(response.data);
        } else {
            setPedidos([]);
            setErro('Nenhum pedido encontrado para este telefone.');
        }
    };

    useEffect(() => {
        setTimeout(() => {
            const telefoneSalvo = localStorage.getItem('marmitaria_telefone_cliente');
            if (telefoneSalvo) {
                setTelefone(telefoneSalvo);
                fazerBusca(telefoneSalvo);
            }
        }, 0);
    }, []);

    const handleBusca = (e) => {
        e.preventDefault();
        fazerBusca(telefone);
    };

    const getStatusIndex = (statusAtual) => {
        if (!statusAtual) return -1;
        const s = statusAtual.toLowerCase();

        if (s === 'pendente') return 0;
        if (s === 'em preparo') return 1;
        if (s === 'saiu para entrega' || s === 'pronto para retirada') return 2;
        if (s === 'entregue') return 3;

        return -1;
    };

    const getBadgeClass = (statusAtual) => {
        if (!statusAtual) return styles.badgeDefault;
        const s = statusAtual.toLowerCase();

        if (s === 'pendente') return styles.badgePendente;
        if (s === 'em preparo') return styles.badgePreparo;
        if (s === 'pronto para retirada') return styles.badgeRetirada;
        if (s === 'saiu para entrega') return styles.badgeEntrega;
        if (s === 'entregue') return styles.badgeEntregue;
        if (s === 'cancelado') return styles.badgeCancelado;

        return styles.badgeDefault;
    };

    const formatarHora = (dataIso) => {
        return new Date(dataIso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatarData = (dataIso) => {
        return new Date(dataIso).toLocaleDateString('pt-BR');
    };

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <button onClick={() => router.push('/')} className={styles.btnVoltar}>
                    <ArrowLeft size={20} />
                </button>
                <h1>Meus Pedidos</h1>
            </header>

            <form onSubmit={handleBusca} className={styles.buscaForm}>
                <input
                    type="tel"
                    placeholder="Digite seu número de telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className={styles.inputBusca}
                />
                <button type="submit" className={styles.btnBuscar} disabled={buscando}>
                    {buscando ? <Clock className={styles.spin} size={20} /> : <Search size={20} />}
                </button>
            </form>

            {erro && <p className={styles.erro}>{erro}</p>}

            {buscando && pedidos.length === 0 && <div className={styles.loading}>Consultando a cozinha...</div>}

            {pedidos.length > 0 && !buscando && (
                <div className={styles.listaPedidos}>
                    {pedidos.map((pedido) => (
                        <div key={pedido.id} className={styles.cardRastreio}>
                            
                            {/* CABEÇALHO DO CARD */}
                            <div className={styles.cardHeader}>
                                <div>
                                    <h2>Pedido #{pedido.id}</h2>
                                    <span>{formatarData(pedido.criado_em)} às {formatarHora(pedido.criado_em)}</span>
                                </div>
                                <div className={`${styles.badgeStatus} ${getBadgeClass(pedido.status)}`}>
                                    {pedido.status}
                                </div>
                            </div>

                            {/* LINHA DO TEMPO / CANCELADO */}
                            {pedido.status.toLowerCase() === 'cancelado' ? (
                                <div className={styles.alertaCancelado}>
                                    <XCircle size={32} />
                                    <p>Este pedido foi cancelado.</p>
                                </div>
                            ) : (
                                <div className={styles.timeline}>
                                    <EtapaTimeline icone={<Clock />} titulo="Pendente" ativo={getStatusIndex(pedido.status) >= 0} />
                                    <div className={`${styles.linha} ${getStatusIndex(pedido.status) >= 1 ? styles.linhaAtiva : ''}`} />

                                    <EtapaTimeline icone={<ChefHat />} titulo="Em Preparo" ativo={getStatusIndex(pedido.status) >= 1} />
                                    <div className={`${styles.linha} ${getStatusIndex(pedido.status) >= 2 ? styles.linhaAtiva : ''}`} />

                                    <EtapaTimeline
                                        icone={pedido.metodo_entrega === 'Retirada' ? <Store /> : <Bike />}
                                        titulo={pedido.metodo_entrega === 'Retirada' ? 'Pronto para Retirada' : 'Saiu para Entrega'}
                                        ativo={getStatusIndex(pedido.status) >= 2}
                                    />
                                    <div className={`${styles.linha} ${getStatusIndex(pedido.status) >= 3 ? styles.linhaAtiva : ''}`} />

                                    <EtapaTimeline icone={<CheckCircle2 />} titulo="Entregue" ativo={getStatusIndex(pedido.status) >= 3} />
                                </div>
                            )}

                            {/* RESUMO DOS ITENS */}
                            <div className={styles.itensResumo}>
                                <h3>Resumo do Pedido</h3>

                                {/* MARMITAS */}
                                {(pedido.marmitas || []).map((marmita) => (
                                    <div key={marmita.id} className={styles.itemMarmita}>
                                        <strong>{marmita.quantidade}x Marmita {marmita.tamanho}</strong>
                                        <span>
                                            {(marmita.alimentos || [])
                                                .map((alimento) => typeof alimento === 'string' ? alimento : alimento.nome)
                                                .join(', ')}
                                        </span>
                                        {/* 👇 ADICIONADO AQUI: Observação da Marmita */}
                                        {marmita.observacao && (
                                            <span className={styles.itemObservacao}>
                                                * Obs: {marmita.observacao}
                                            </span>
                                        )}
                                    </div>
                                ))}

                                {/* PRODUTOS */}
                                {(pedido.produtos || []).map((produto) => (
                                    <div key={produto.id} className={styles.itemMarmita}>
                                        <strong>{produto.quantidade}x {produto.nome}</strong>
                                        <span>
                                            {produto.categoria_nome || 'Complemento'}
                                            {' • '}
                                            R$ {Number(produto.subtotal).toFixed(2).replace('.', ',')}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* RODAPÉ COM TOTAL */}
                            <div className={styles.cardFooter}>
                                <strong>Total:</strong>
                                <span>R$ {Number(pedido.valor_total).toFixed(2).replace('.', ',')}</span>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}

const EtapaTimeline = ({ icone, titulo, ativo }) => (
    <div className={`${styles.etapa} ${ativo ? styles.etapaAtiva : ''}`}>
        <div className={styles.iconeWrap}>{icone}</div>
        <span>{titulo}</span>
    </div>
);