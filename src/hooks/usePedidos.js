// 'use client';

// import {
//     useState
// } from 'react';

// import toast from 'react-hot-toast';

// import {
//     criarPedido,
//     criarPedidoAdmin,
//     listarPedidoPorTelefoneUsuario
// } from '@/services/pedidosService.js';


// export function usePedidos() {

//     const [
//         enviando,
//         setEnviando
//     ] = useState(false);


//     const [
//         buscando,
//         setBuscando
//     ] = useState(false);


//     /**
//      * ============================================================
//      * FINALIZAR PEDIDO
//      * ============================================================
//      *
//      * O Hook somente envia.
//      *
//      * Quem decide quando limpar o carrinho é a tela
//      * que chamou esta função.
//      */
//     const finalizarPedidoNoBanco =
//     async (
//         payload,
//         options = {}
//     ) => {

//         const admin =
//             options.admin ===
//             true;


//         setEnviando(
//             true
//         );


//         try {

//             const response =
//                 admin

//                     ? await criarPedidoAdmin(
//                         payload
//                     )

//                     : await criarPedido(
//                         payload
//                     );


//             toast.success(
//                 'Pedido registrado com sucesso!'
//             );


//             return response;


//         } catch (error) {

//             toast.error(

//                 error
//                     ?.response
//                     ?.data
//                     ?.message

//                 ||

//                 'Falha ao registrar pedido no servidor.'
//             );


//             return null;


//         } finally {

//             setEnviando(
//                 false
//             );
//         }
//     };


//     /**
//      * ============================================================
//      * BUSCAR PEDIDO
//      * ============================================================
//      */
//     const buscarPedidoPorTelefoneUsuario =
//         async (
//             telefone
//         ) => {

//             setBuscando(
//                 true
//             );


//             try {

//                 const numeroLimpo =
//                     telefone.replace(
//                         /\D/g,
//                         ''
//                     );


//                 return await listarPedidoPorTelefoneUsuario(
//                     numeroLimpo
//                 );

//             } catch (error) {

//                 console.error(
//                     'Erro na busca:',
//                     error
//                 );


//                 return null;

//             } finally {

//                 setBuscando(
//                     false
//                 );
//             }
//         };


//     return {

//         finalizarPedidoNoBanco,

//         buscarPedidoPorTelefoneUsuario,

//         buscando,

//         enviando
//     };
// }

'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { renderToString } from 'react-dom/server';

import { 
    criarPedido, 
    criarPedidoAdmin, 
    listarPedidoPorTelefoneUsuario 
} from '@/services/pedidosService.js';

// Importações do QZ Tray e Configurações
import { buscarDadosEmpresa } from '@/services/dadosEmpresaService.js';
import { imprimirCupom } from '@/utils/qzService.js';
import CupomPedido from '@/components/CupomPedido/cupomPedido'; // Ajuste a extensão se necessário

export function usePedidos() {
    const [enviando, setEnviando] = useState(false);
    const [buscando, setBuscando] = useState(false);

    /**
     * FINALIZAR PEDIDO (Com integração QZ Tray)
     */
    const finalizarPedidoNoBanco = async (payload, options = {}) => {
        const admin = options.admin === true;
        setEnviando(true);

        try {
            // 1. Salva o pedido no Backend
            const response = admin ? await criarPedidoAdmin(payload) : await criarPedido(payload);
            toast.success('Pedido registrado com sucesso!');

            // 2. 🚨 INTEGRAÇÃO QZ TRAY (Somente se for o PDV/Admin criando)
            if (admin) {
                try {
                    // Busca as configurações atualizadas direto do banco
                    const resEmpresa = await buscarDadosEmpresa();
                    const config = resEmpresa.data;

                    if (config?.imprimir_automaticamente && config?.nome_impressora) {
                        const pedidoSalvo = response.data?.data || response.data;
                        
                        // Transforma o componente React em HTML puro
                        const htmlDoCupom = renderToString(<CupomPedido pedido={pedidoSalvo} />);
                        
                        // Dispara a impressão na porta mapeada (COM5 / Kapbom)
                        await imprimirCupom(htmlDoCupom, config.nome_impressora);
                    }
                } catch (printError) {
                    console.error('Erro na impressão automática:', printError);
                    toast.error('Pedido salvo, mas falha ao comunicar com a impressora térmica.');
                }
            }

            return response;

        } catch (error) {
            toast.error(
                error?.response?.data?.message || 'Falha ao registrar pedido no servidor.'
            );
            return null;
        } finally {
            setEnviando(false);
        }
    };

    /**
     * BUSCAR PEDIDO
     */
    const buscarPedidoPorTelefoneUsuario = async (telefone) => {
        setBuscando(true);
        try {
            const numeroLimpo = telefone.replace(/\D/g, '');
            return await listarPedidoPorTelefoneUsuario(numeroLimpo);
        } catch (error) {
            console.error('Erro na busca:', error);
            return null;
        } finally {
            setBuscando(false);
        }
    };

    return {
        finalizarPedidoNoBanco,
        buscarPedidoPorTelefoneUsuario,
        buscando,
        enviando
    };
}