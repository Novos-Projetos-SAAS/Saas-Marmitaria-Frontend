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

import { useState, useEffect, useCallback } from "react";
import { buscarCardapioCompleto, toggleDisponibilidade, zerarCardapioDiario } from "@/services/cardapioService.js";
import Swal from "sweetalert2";

export function useCardapio() {
    const [alimentos, setAlimentos] = useState([]);
    const [loading, setLoading] = useState(true);

    const carregarCardapio = useCallback(async () => {
        setLoading(true);
        try {
            const data = await buscarCardapioCompleto();
            setAlimentos(data);
        } catch (error) {
            Swal.fire('Erro', 'Não foi possível carregar os itens do cardápio.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        carregarCardapio();
    }, [carregarCardapio]);

    const handleToggle = async (id, currentStatus) => {
        const novoStatus = !currentStatus;
        
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

    const handleZerarCardapio = async () => {
        const result = await Swal.fire({
            title: 'Encerrar Expediente?',
            text: "TODOS os alimentos do cardápio ficarão indisponíveis para venda.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sim, fechar loja!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                await zerarCardapioDiario();
                await carregarCardapio(); 
                Swal.fire('Encerrado!', 'O cardápio foi zerado com sucesso.', 'success');
            } catch (error) {
                Swal.fire('Erro', 'Falha ao tentar zerar o cardápio.', 'error');
                setLoading(false);
            }
        }
    };

    const cardapioAgrupado = alimentos.reduce((acc, alimento) => {
        const categoria = alimento.categoria_nome || 'Outros';
        if (!acc[categoria]) {
            acc[categoria] = [];
        }
        acc[categoria].push(alimento);
        return acc;
    }, {});

    return { cardapioAgrupado, loading, handleToggle, handleZerarCardapio };
}