// // 'use client'

// // import { useState, useEffect, useCallback } from "react";
// // import { buscarTamanhosMarmitasParaMontagem } from "../services/tamanhosMarmitasService";
// // import { buscarAlimentos } from "../services/alimentosService.js";
// // import toast from "react-hot-toast";

// // export function useCardapio() {
// //     const [tamanhos, setTamanhos] = useState([]);
// //     const [alimentos, setAlimentos] = useState([]);
// //     const [loading, setLoading] = useState(true);

// //     useEffect(() => {

// //         async function carregar() {

// //             try {
// //                 const [tamanhosData, alimentosData] = await Promise.all([
// //                     buscarTamanhosMarmitasParaMontagem(),
// //                     buscarAlimentos()
// //                 ]);

// //                 setTamanhos(tamanhosData || []);
// //                 setAlimentos(alimentosData || []);

// //             } catch (error) {

// //                 console.error(error);
// //                 toast.error("Não foi possível carregar o cardápio.");

// //             } finally {

// //                 setLoading(false);

// //             }
// //         }

// //         carregar();

// //     }, []);

// //     return {
// //         tamanhos,
// //         alimentos,
// //         loading
// //     };
// // }

// 'use client'

// import { useState, useEffect } from "react";
// import { buscarTamanhosMarmitasParaMontagem } from "@/services/tamanhosMarmitasService";
// // 🚀 Sugiro criar essa função específica no service do cliente
// import { buscarAlimentosDisponiveisHoje } from "@/services/alimentosService.js";
// import toast from "react-hot-toast";

// export function useCardapioClient() {
//     const [tamanhos, setTamanhos] = useState([]);
//     // Mudamos de array simples para um objeto agrupado por categorias
//     const [alimentosAgrupados, setAlimentosAgrupados] = useState({});
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         async function carregar() {
//             try {
//                 // Promise.all é excelente aqui, carrega tamanhos e alimentos em paralelo!
//                 const [tamanhosData, alimentosData] = await Promise.all([
//                     buscarTamanhosMarmitasParaMontagem(),
//                     buscarAlimentosDisponiveisHoje()
//                 ]);

//                 setTamanhos(tamanhosData || []);

//                 // 🚀 O PULO DO GATO: Agrupando os alimentos para a tela do cliente
//                 const arrayAlimentos = alimentosData || [];
//                 const agrupados = arrayAlimentos.reduce((acc, alimento) => {
//                     // Usa o nome da categoria que vem do JOIN do banco
//                     const categoria = alimento.categoria_nome || 'Outros';
//                     if (!acc[categoria]) {
//                         acc[categoria] = [];
//                     }
//                     acc[categoria].push(alimento);
//                     return acc;
//                 }, {});

//                 setAlimentosAgrupados(agrupados);

//             } catch (error) {
//                 console.error(error);
//                 toast.error("Não foi possível carregar o cardápio de hoje.");
//             } finally {
//                 setLoading(false);
//             }
//         }

//         carregar();

//     }, []);

//     return {
//         tamanhos,
//         alimentosAgrupados, // Retorna já separadinho (Proteínas, Saladas, etc)
//         loading
//     };
// }


// src/hooks/useCardapio.js (SOMENTE PARA O ADMIN)
'use client'

import { useState, useEffect } from "react";
import { buscarCardapioCompleto, toggleDisponibilidade, zerarCardapioDiario } from "@/services/cardapioService.js";
import Swal from "sweetalert2";

export function useCardapio() {
    const [alimentos, setAlimentos] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🚀 1. O EFEITO DE MONTAGEM (À prova do Next.js)
    // Definimos a função async DENTRO do useEffect. O React ama isso e não reclama.
    useEffect(() => {
        let isMounted = true;

        async function carregarInicial() {
            try {
                const data = await buscarCardapioCompleto();
                if (isMounted) setAlimentos(data);
            } catch (error) {
                if (isMounted) Swal.fire('Erro', 'Não foi possível carregar os itens do cardápio.', 'error');
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        carregarInicial();

        // Cleanup function evita vazamento de memória se o usuário mudar de tela rápido
        return () => { isMounted = false; };
    }, []); 

    // 🚀 2. FUNÇÃO MANUAL (Para ser usada pelos botões, como o de Zerar)
    const recarregarCardapioManualmente = async () => {
        setLoading(true);
        try {
            const data = await buscarCardapioCompleto();
            setAlimentos(data);
        } catch (error) {
            Swal.fire('Erro', 'Não foi possível atualizar a tela.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // 🚀 Ação da Chavinha (Toggle)
    const handleToggle = async (id, currentStatus) => {
        const novoStatus = !currentStatus;
        
        // Atualização otimista na tela
        setAlimentos(prev => prev.map(item => 
            item.id === id ? { ...item, disponivel_hoje: novoStatus } : item
        ));

        try {
            await toggleDisponibilidade(id, novoStatus);
        } catch (error) {
            setAlimentos(prev => prev.map(item => 
                item.id === id ? { ...item, disponivel_hoje: currentStatus } : item
            ));
            Swal.fire('Erro', 'Falha ao conectar com o servidor.', 'error');
        }
    };

    // 🚀 Botão Vermelho (Zerar tudo e Fechar Loja)
    const handleZerarCardapio = async () => {
        const result = await Swal.fire({
            title: 'Encerrar Expediente?',
            text: "TODOS os alimentos ficarão indisponíveis para venda e a loja será fechada.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sim, encerrar tudo!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                // Aqui você pode adicionar a lógica de fechar a loja no backend como conversamos
                await zerarCardapioDiario(); 
                
                // Recarrega a tela usando a função manual
                await recarregarCardapioManualmente(); 
                
                Swal.fire('Encerrado!', 'O cardápio foi zerado com sucesso.', 'success');
            } catch (error) {
                Swal.fire('Erro', 'Falha ao tentar zerar o cardápio.', 'error');
                setLoading(false);
            }
        }
    };

    // Agrupa os dados para a interface
    const cardapioAgrupado = alimentos.reduce((acc, alimento) => {
        const categoria = alimento.categoria_nome || 'Outros';
        if (!acc[categoria]) {
            acc[categoria] = [];
        }
        acc[categoria].push(alimento);
        return acc;
    }, {});

    return {
        cardapioAgrupado,
        loading,
        handleToggle,
        handleZerarCardapio
    };
}