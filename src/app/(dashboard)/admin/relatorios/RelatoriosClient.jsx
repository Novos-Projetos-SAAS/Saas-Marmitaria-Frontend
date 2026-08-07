"use client";

import { useState, useEffect, useMemo } from "react";

import { useRelatorios } from "@/hooks/useRelatorios";

import Table from "@/components/ui/table";
import Can from "@/components/ui/can";
import ReportActionMenu from "@/components/ui/reportActionMenu";
import reportActionMenuStyles from "@/components/ui/reportActionMenu/index.module.css";
import ModalFiltrosRelatorio from "@/components/modals/filtrosRelatorio/filtrosRelatorioModal.jsx";


import { gerarExcel, gerarPDF } from "@/utils/exportRelatorios";
import { FileText, Download, Printer, Search } from "lucide-react";
import Swal from "sweetalert2";

import styles from "./RelatoriosClient.module.css";

const CAMPOS_DINHEIRO = [
    "valor",
    "valor_total",
    "total",
    "total_faturado",
    "ticket_medio",
    "preco",
    "subtotal",
    "desconto",
    "acrescimo",
    "troco",
    "faturamento"
];

// const ehCampoDinheiro = (chave = "") =>
//     CAMPOS_DINHEIRO.some(campo => chave.includes(campo));

const ehCampoDinheiro = (chave = "") => {
    const chaveMinuscula = chave.toLowerCase();

    // Se a chave for uma data, bloqueia a formatação de dinheiro imediatamente
    if (chaveMinuscula.includes("data") || chaveMinuscula.includes("criado_em")) {
        return false;
    }

    return CAMPOS_DINHEIRO.some(campo => chaveMinuscula.includes(campo));
};

const formatarValor = (valor, chave) => {

    if (valor == null) return "";

    if (ehCampoDinheiro(chave)) {
        return `R$ ${Number(valor).toFixed(2).replace(".", ",")}`;
    }

    return valor;
};

export default function RelatoriosClient() {

    const { relatorios, loading, fetchRelatorios, fetchDadosRelatorio, loadingGeracao } = useRelatorios();
    const [inputValue, setInputValue] = useState("");
    const [relatorioSelecionado, setRelatorioSelecionado] = useState(null);
    const [acaoSelecionada, setAcaoSelecionada] = useState(null);
    const [dadosImpressao, setDadosImpressao] = useState(null);

    useEffect(() => {
        fetchRelatorios();
    }, [fetchRelatorios]);

    useEffect(() => {
        if (dadosImpressao) {
            // Dá tempo para o navegador pintar a tabela no DOM
            const timer = setTimeout(() => {
                window.print();
            }, 500);

            // Limpa os dados da memória quando o usuário fechar a tela de impressão
            const onAfterPrint = () => setDadosImpressao(null);
            window.addEventListener('afterprint', onAfterPrint);

            return () => {
                clearTimeout(timer);
                window.removeEventListener('afterprint', onAfterPrint);
            };
        }
    }, [dadosImpressao]);

    const relatoriosFiltrados = useMemo(() => {

        if (!inputValue) return relatorios;

        return relatorios.filter(rel =>
            rel.nome.toLowerCase().includes(inputValue.toLowerCase()) ||
            rel.descricao.toLowerCase().includes(inputValue.toLowerCase())
        );
    }, [relatorios, inputValue]);

    const handleAbrirAcao = (relatorio, acao) => {
        setRelatorioSelecionado(relatorio);
        setAcaoSelecionada(acao);
    };

    const handleConfirmarGeracao = async (filtros) => {

        try {
            const relatorioGerado = await fetchDadosRelatorio(relatorioSelecionado.id, filtros);

            const relatorioComFiltros = {
                ...relatorioGerado,
                filtros_aplicados: filtros
            };

            if (acaoSelecionada === 'excel') {
                gerarExcel(relatorioComFiltros);
            } else if (acaoSelecionada === 'pdf') {
                gerarPDF(relatorioComFiltros);
            } else if (acaoSelecionada === 'imprimir') {
                setDadosImpressao(relatorioComFiltros);
            }

            setRelatorioSelecionado(null);

        } catch (error) {
            console.error(error);
            Swal.fire('Erro', 'Falha ao gerar o relatório. Verifique o console.', 'error');
        }
    };

    const columns = [

        { header: "Nome do Relatório", accessor: "nome" },
        {
            header: "Descrição",
            accessor: "descricao",
            className: styles.hiddenMobile // Esconde no mobile
        },
        {
            header: "Gerar",
            accessor: "id",
            className: styles.actionCell,
            render: (value, row, index) => {
                const item = row || value;
                if (!item) return null;
                const isLastItems = index >= relatorios.length - 2;
                return (
                    <>
                        {/* 🖥️ AÇÕES DE DESKTOP */}
                        <div className={styles.desktopActions}>
                            <Can perform="relatorios.gerar">
                                <button onClick={() => handleAbrirAcao(item, 'pdf')} className={styles.actionButton} title="Gerar PDF">
                                    <FileText size={18} color="#dc2626" />
                                </button>

                                {/* <button onClick={() => handleAbrirAcao(item, 'excel')} className={styles.actionButton} title="Gerar Excel">
                                    <Download size={18} color="#16a34a" />
                                </button> */}

                                <button onClick={() => handleAbrirAcao(item, 'imprimir')} className={styles.actionButton} title="Imprimir Relatório">
                                    <Printer size={18} color="#2563eb" />
                                </button>
                            </Can>
                        </div>

                        {/* 📱 AÇÕES DE MOBILE (ActionMenu) */}
                        <div className={styles.mobileActions}>

                            <Can perform="relatorios.gerar">

                                <ReportActionMenu isLast={isLastItems}>
                                    <button
                                        type="button"
                                        className={reportActionMenuStyles.item}
                                        onClick={() => handleAbrirAcao(item, "pdf")}
                                    >
                                        <FileText size={16} color="#dc2626" />

                                        <span>Gerar PDF</span>

                                    </button>
                                    {/* 
                                    <button
                                        type="button"
                                        className={reportActionMenuStyles.item}
                                        onClick={() => handleAbrirAcao(item, "excel")}
                                    >
                                        <Download size={16} color="#16a34a" />
                                        <span>Gerar Excel</span>
                                    </button> */}

                                    <button
                                        type="button"
                                        className={reportActionMenuStyles.item}
                                        onClick={() => handleAbrirAcao(item, "imprimir")}
                                    >
                                        <Printer size={16} color="#2563eb" />
                                        <span>Imprimir</span>
                                    </button>
                                </ReportActionMenu>
                            </Can>
                        </div>
                    </>
                );
            },
        }
    ];

    return (
        <>
            <div className="no-print">
                <div className={styles.wrapper}>

                    {/* BARRA DE PESQUISA (Alinhada com Usuarios) */}
                    <div className={styles.actionsBar}>
                        <div className={styles.filtersGroup}>
                            <div className={styles.searchWrapper}>
                                <Search size={20} className={styles.searchIcon} />
                                <input
                                    type="text"
                                    placeholder="Buscar relatório..."
                                    className={styles.searchInput}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.tableContainer}>
                        <Table columns={columns} data={relatoriosFiltrados} isLoading={loading} />
                    </div>

                </div>

                {relatorioSelecionado && (

                    <ModalFiltrosRelatorio
                        relatorio={relatorioSelecionado}
                        acao={acaoSelecionada}
                        onClose={() => setRelatorioSelecionado(null)}
                        onConfirm={handleConfirmarGeracao}
                        loading={loadingGeracao}
                    />
                )}
            </div>

            {dadosImpressao && (
                <div className="area-impressao">

                    {/* INJEÇÃO DE CSS BLINDADA CONTRA O BUILD DA VERCEL */}
                    <style type="text/css" media="print" dangerouslySetInnerHTML={{ __html: `
                        @page { 
                            size: landscape !important; 
                            margin: 1cm !important; 
                        }
                        
                        html, body, #__next, #root, main { 
                            height: auto !important; 
                            min-height: auto !important;
                            overflow: visible !important;
                            display: block !important; 
                            width: 100% !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }

                        .no-print { 
                            display: none !important; 
                        }

                        .area-impressao { 
                            display: block !important; 
                            position: static !important; 
                            width: 100% !important;
                            max-width: 100% !important;
                            visibility: visible !important;
                        }
                        
                        .area-impressao * { 
                            visibility: visible !important; 
                        }

                        .tabela-impressao { 
                            width: 100% !important; 
                            page-break-inside: auto; 
                        }

                        .tabela-impressao thead { 
                            display: table-header-group; 
                        }

                        .tabela-impressao tfoot { 
                            display: table-footer-group; 
                        }

                        .tabela-impressao tr { 
                            page-break-inside: avoid; 
                            page-break-after: auto; 
                        }
                    `}} />

                    <div style={{ marginBottom: '20px', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                        <h2 style={{ textAlign: 'left', margin: '0 0 8px 0', fontSize: '24px', color: '#111827' }}>
                            {dadosImpressao.nome}
                        </h2>

                        {/* Exibe os filtros se eles existirem */}
                        {dadosImpressao.filtros_aplicados && (
                            <div style={{ fontSize: '14px', color: '#4b5563' }}>

                                {/* Linha do Período */}
                                {(dadosImpressao.filtros_aplicados.data_inicio || dadosImpressao.filtros_aplicados.data_fim) && (
                                    <p style={{ margin: '0 0 4px 0' }}>
                                        <strong>Período: </strong>
                                        {dadosImpressao.filtros_aplicados.data_inicio
                                            ? dadosImpressao.filtros_aplicados.data_inicio.split('-').reverse().join('/')
                                            : 'Início dos registros'
                                        }
                                        {' até '}
                                        {dadosImpressao.filtros_aplicados.data_fim
                                            ? dadosImpressao.filtros_aplicados.data_fim.split('-').reverse().join('/')
                                            : 'Hoje'
                                        }
                                    </p>
                                )}

                                {/* Loop DINÂMICO para o restante dos filtros */}
                                {Object.entries(dadosImpressao.filtros_aplicados).map(([chave, valor]) => {
                                    // Pula as datas (já exibidas) e valores em branco
                                    if (chave === 'data_inicio' || chave === 'data_fim' || !valor) return null;

                                    // Limpa a chave (ex: "tipo_entrega" vira "Tipo Entrega")
                                    const labelFormatada = chave.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                                    return (
                                        <p key={chave} style={{ margin: '0 0 4px 0' }}>
                                            <strong>{labelFormatada}: </strong>
                                            <span style={{ textTransform: 'capitalize' }}>
                                                {String(valor)}
                                            </span>
                                        </p>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <table className="tabela-impressao" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                        <thead>
                            <tr>
                                {dadosImpressao.colunas.map((c, i) => (
                                    <th key={i} style={{
                                        border: '1px solid #d1d5db',
                                        padding: '10px 8px',
                                        textAlign: 'left',
                                        background: '#1f2937', // Fundo escuro igual PDF
                                        color: '#ffffff', // Texto branco igual PDF
                                        fontWeight: 'bold',
                                        boxShadow: 'inset 0 0 0 1000px #1f2937',
                                        WebkitPrintColorAdjust: 'exact',
                                        printColorAdjust: 'exact'
                                    }}>
                                        {c.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {dadosImpressao.dados.length > 0 ? (
                                dadosImpressao.dados.map((linha, i) => {
                                    // Alternar a cor da linha (zebra) como no PDF
                                    const bgColor = i % 2 === 0 ? '#ffffff' : '#f8fafc';

                                    return (
                                        <tr key={i} style={{
                                            background: bgColor,
                                            boxShadow: `inset 0 0 0 1000px ${bgColor}`,
                                            WebkitPrintColorAdjust: 'exact',
                                            printColorAdjust: 'exact'
                                        }}>
                                            {dadosImpressao.colunas.map((col, j) => (
                                                <td key={j} style={{ border: "1px solid #d1d5db", padding: "8px", color: "#374151" }}>
                                                    {formatarValor(linha[col.chave], col.chave)}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={dadosImpressao.colunas.length} style={{ border: "1px solid #d1d5db", padding: "10px", textAlign: "center" }}>
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>

                        {dadosImpressao.dados.length > 0 && (
                            <tfoot>
                                <tr id="linha-total-print">
                                    {dadosImpressao.colunas.map((col, colIndex) => {
                                        if (colIndex === 0) return <td key={colIndex} style={tdTotalStyle}>TOTAL:</td>;
                                        if (col.totalizar) {
                                            const soma = dadosImpressao.dados.reduce((acc, linha) => acc + Number(linha[col.chave] || 0), 0);
                                            return (
                                                <td key={colIndex} style={tdTotalStyle}>
                                                    {ehCampoDinheiro(col.chave) ? `R$ ${soma.toFixed(2).replace(".", ",")}` : soma}
                                                </td>
                                            );
                                        }
                                        return <td key={colIndex} style={tdTotalStyle}>-</td>;
                                    })}
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            )}
        </>
    );
}

const tdTotalStyle = {
    border: '1px solid #9ca3af',
    padding: '10px 8px',
    fontWeight: 'bold',
    background: '#e5e7eb',
    color: '#111827',
    boxShadow: 'inset 0 0 0 1000px #e5e7eb',
    WebkitPrintColorAdjust: 'exact',
    printColorAdjust: 'exact'
};