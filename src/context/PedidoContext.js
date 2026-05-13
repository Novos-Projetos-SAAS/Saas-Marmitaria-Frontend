'use client'; // 👈 ESSA LINHA É OBRIGATÓRIA E TEM QUE SER A PRIMEIRA

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';

const PedidoContext = createContext();

export function PedidoProvider({ children }) {
    const [carrinho, setCarrinho] = useState([]);
    const [marmitaAtual, setMarmitaAtual] = useState({
        tamanho: null,
        itens: []
    });
    const [sucessoPedido, setSucessoPedido] = useState(false);

    const iniciarNovaMarmita = useCallback((tamanho) => {
        setMarmitaAtual({
            tamanho,
            itens: []
        });
    }, []);

    // const alternarAlimento = useCallback((alimento, limiteDaCategoria) => {
    //     setMarmitaAtual((prev) => {
    //         const jaSelecionado = prev.itens.find(i => i.id === alimento.id);

    //         if (jaSelecionado) {
    //             return {
    //                 ...prev,
    //                 itens: prev.itens.filter(i => i.id !== alimento.id)
    //             };
    //         }

    //         const itensDaMesmaCategoria = prev.itens.filter(
    //             i => i.categoria_id === alimento.categoria_id
    //         ).length;

    //         if (itensDaMesmaCategoria >= limiteDaCategoria) {
    //             toast.error(`Limite atingido! Esta categoria permite apenas ${limiteDaCategoria} opções.`);
    //             return prev;
    //         }

    //         return {
    //             ...prev,
    //             itens: [...prev.itens, alimento]
    //         };
    //     });
    // }, []);

    const alternarAlimento = useCallback((alimento, limiteDaCategoria) => {

        const jaSelecionado = marmitaAtual.itens.find(
            i => i.id === alimento.id
        );

        if (jaSelecionado) {

            setMarmitaAtual(prev => ({
                ...prev,
                itens: prev.itens.filter(i => i.id !== alimento.id)
            }));

            return;
        }

        const itensDaMesmaCategoria = marmitaAtual.itens.filter(
            i => i.categoria_id === alimento.categoria_id
        ).length;

        if (itensDaMesmaCategoria >= limiteDaCategoria) {

            toast.error(
                `Limite atingido! Esta categoria permite apenas ${limiteDaCategoria} opções.`
            );

            return;
        }

        setMarmitaAtual(prev => ({
            ...prev,
            itens: [...prev.itens, alimento]
        }));

    }, [marmitaAtual]);

    const adicionarAoCarrinho = useCallback((quantidade = 1) => {
        if (!marmitaAtual.tamanho || marmitaAtual.itens.length === 0) {
            toast.error("Selecione os itens da sua marmita.");
            return false;
        }

        const novaMarmita = {
            id_temp: Date.now(),
            tamanho: marmitaAtual.tamanho,
            itens: marmitaAtual.itens,
            quantidade: Number(quantidade),
            subtotal: Number(marmitaAtual.tamanho.preco_base) * Number(quantidade)
        };

        setCarrinho(prev => [...prev, novaMarmita]);
        setMarmitaAtual({ tamanho: null, itens: [] });
        toast.success("Adicionado ao carrinho!");
        return true;
    }, [marmitaAtual]);

    const removerDoCarrinho = (indexParaRemover) => {
        // Filtra o carrinho, mantendo todos os itens EXCETO o que tem o index igual ao clicado
        const novoCarrinho = carrinho.filter((_, index) => index !== indexParaRemover);
        setCarrinho(novoCarrinho);
    }

    const limparCarrinho = useCallback(() => {
        setCarrinho([]);
    }, []);

    const totalGeral = useMemo(() => {
        return carrinho.reduce((acc, item) => acc + item.subtotal, 0);
    }, [carrinho]);

    return (
        <PedidoContext.Provider value={{
            carrinho,
            marmitaAtual,
            iniciarNovaMarmita,
            alternarAlimento,
            adicionarAoCarrinho,
            limparCarrinho,
            totalGeral,
            sucessoPedido,
            setSucessoPedido,
            removerDoCarrinho
        }}>
            {children}
        </PedidoContext.Provider>
    );
}

export const usePedido = () => {
    const context = useContext(PedidoContext);
    if (!context) {
        throw new Error('usePedido deve ser usado dentro de um PedidoProvider');
    }
    return context;
};