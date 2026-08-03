'use client';

import {
    useEffect,
    useState
} from 'react';

import toast from 'react-hot-toast';

import {
    buscarProdutosCardapio
} from '@/services/produtosService.js';


/**
 * Hook utilizado somente pelo cardápio público.
 *
 * O Backend já retorna:
 *
 * Categoria
 * └── Produtos
 *
 * portanto não precisamos reagrupar novamente no Frontend.
 */
export function useProdutosCardapio() {

    const [
        categoriasProdutos,
        setCategoriasProdutos
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    useEffect(() => {

        let componenteAtivo =
            true;


        async function carregarProdutos() {

            try {

                const dados =
                    await buscarProdutosCardapio();


                if (
                    componenteAtivo
                ) {

                    setCategoriasProdutos(
                        dados || []
                    );
                }

            } catch (error) {

                console.error(
                    'Erro ao carregar complementos:',
                    error
                );


                if (
                    componenteAtivo
                ) {

                    toast.error(
                        'Não foi possível carregar os complementos de hoje.'
                    );
                }

            } finally {

                if (
                    componenteAtivo
                ) {

                    setLoading(
                        false
                    );
                }
            }
        }


        carregarProdutos();


        return () => {

            componenteAtivo =
                false;
        };

    }, []);


    return {

        categoriasProdutos,

        loading
    };
}