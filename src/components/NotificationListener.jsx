'use client';

import {
    useEffect
} from 'react';

import {
    useRouter
} from 'next/navigation';

import {
    io
} from 'socket.io-client';

import toast from 'react-hot-toast';


export default function NotificationListener() {

    const router =
        useRouter();


    useEffect(() => {

        const socket =
            io(
                process.env
                    .NEXT_PUBLIC_API_URL ||

                'http://localhost:3333',
                {

                    /**
                     * Envia o cookie HTTP Only
                     * durante o handshake.
                     */
                    withCredentials:
                        true
                }
            );


        socket.on(
            'novo_pedido_recebido',
            novoPedido => {

                /**
                 * Toca o alerta sonoro.
                 */
                const audio =
                    new Audio(
                        '/sons/campainha.mp3'
                    );


                audio
                    .play()
                    .catch(
                        () => {

                            console.log(
                                'Áudio aguardando interação do usuário.'
                            );
                        }
                    );


                toast.success(
                    t => (

                        <div
                            className="no-print"
                            style={{

                                display:
                                    'flex',

                                flexDirection:
                                    'column',

                                gap:
                                    '10px'
                            }}
                        >

                            <span>

                                📢 Novo Pedido{' '}

                                <b>
                                    #{novoPedido.id}
                                </b>{' '}

                                de{' '}

                                <b>
                                    {novoPedido.nome_cliente}
                                </b>

                            </span>


                            <button
                                type="button"
                                onClick={() => {

                                    toast.dismiss(
                                        t.id
                                    );


                                    router.push(
                                        '/admin/pedidos'
                                    );
                                }}
                                style={{

                                    backgroundColor:
                                        '#EA580C',

                                    color:
                                        '#FFFFFF',

                                    border:
                                        'none',

                                    borderRadius:
                                        '6px',

                                    padding:
                                        '6px 12px',

                                    fontWeight:
                                        600,

                                    cursor:
                                        'pointer'
                                }}
                            >

                                Ver Pedido

                            </button>

                        </div>
                    ),
                    {

                        duration:
                            7000,

                        position:
                            'top-right',

                        id:
                            `toast-pedido-${novoPedido.id}`
                    }
                );


                /**
                 * O hook da lista administrativa
                 * ouvirá este evento e fará uma nova
                 * consulta autenticada à API.
                 */
                window.dispatchEvent(
                    new CustomEvent(
                        'marmitaria:pedidos-atualizados'
                    )
                );
            }
        );


        socket.on(
            'pedido_atualizado',
            () => {

                window.dispatchEvent(
                    new CustomEvent(
                        'marmitaria:pedidos-atualizados'
                    )
                );
            }
        );


        socket.on(
            'connect_error',
            error => {

                console.warn(
                    'Socket administrativo indisponível:',
                    error.message
                );
            }
        );


        return () => {

            socket.disconnect();
        };

    }, [
        router
    ]);


    return null;
}