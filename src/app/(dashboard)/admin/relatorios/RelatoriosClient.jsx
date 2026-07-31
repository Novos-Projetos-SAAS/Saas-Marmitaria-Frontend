"use client";

import { useState, useEffect, useMemo } from "react";
import { useRelatorios } from "@/hooks/useRelatorios";

import Table from "@/components/ui/table";
import Can from "@/components/ui/can";
import ModalFiltrosRelatorio from "@/components/modals/filtrosRelatorio/filtrosRelatorioModal.jsx";
import { gerarExcel, gerarPDF } from "@/utils/exportRelatorios";

import { FileText, Download, Printer, Search } from "lucide-react";
import Swal from "sweetalert2";
import styles from "./RelatoriosClient.module.css";

export default function RelatoriosClient() {
    const { relatorios, loading, fetchRelatorios, fetchDadosRelatorio, loadingGeracao } = useRelatorios();

    const [inputValue, setInputValue] = useState("");
    const [relatorioSelecionado, setRelatorioSelecionado] = useState(null);
    const [acaoSelecionada, setAcaoSelecionada] = useState(null); 
    const [dadosImpressao, setDadosImpressao] = useState(null);

    useEffect(() => {
        fetchRelatorios();
    }, [fetchRelatorios]);

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
            
            if (acaoSelecionada === 'excel') {
                gerarExcel(relatorioGerado);
                // Swal.fire({ title: 'Sucesso!', text: 'Planilha Excel baixada com sucesso.', icon: 'success', confirmButtonColor: '#16a34a' });
            } 
            else if (acaoSelecionada === 'pdf') {
                gerarPDF(relatorioGerado);
                // Swal.fire({ title: 'Sucesso!', text: 'Documento PDF gerado com sucesso.', icon: 'success', confirmButtonColor: '#16a34a' });
            } 
            else if (acaoSelecionada === 'imprimir') {
                setDadosImpressao(relatorioGerado);
                setTimeout(() => window.print(), 800);
            }

            setRelatorioSelecionado(null);
        } catch (error) {
            console.error(error);
            Swal.fire('Erro', 'Falha ao gerar o relatório. Verifique o console.', 'error');
        }
    };

    const columns = [
        { header: "Nome do Relatório", accessor: "nome" },
        { header: "Descrição", accessor: "descricao" },
        {
            header: "Gerar",
            accessor: "id",
            className: styles.actionCell,
            render: (value, row) => {
                const item = row || value;
                if (!item) return null;

                return (
                    <div className={styles.desktopActions}>
                        <Can perform="relatorios.gerar">
                            <button onClick={() => handleAbrirAcao(item, 'pdf')} className={styles.actionButton} title="Gerar PDF">
                                <FileText size={18} color="#dc2626" />
                            </button>
                            <button onClick={() => handleAbrirAcao(item, 'excel')} className={styles.actionButton} title="Gerar Excel">
                                <Download size={18} color="#16a34a" />
                            </button>
                            <button onClick={() => handleAbrirAcao(item, 'imprimir')} className={styles.actionButton} title="Imprimir Relatório">
                                <Printer size={18} color="#2563eb" />
                            </button>
                        </Can>
                    </div>
                );
            },
        }
    ];

    return (
        <>
            {/* TUDO O QUE NÃO DEVE SAIR NA IMPRESSÃO FICA AQUI DENTRO */}
            <div className="no-print">
                <div className={styles.wrapper}>
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

            {/* A TABELA DE IMPRESSÃO FICA FORA, COMO VOCÊ FEZ NO CUPOM PEDIDO */}
            {dadosImpressao && (
                <div className={styles.printOnly}>
                    <h2 style={{ textAlign: 'center', marginBottom: '20px', fontFamily: 'sans-serif' }}>
                        {dadosImpressao.nome}
                    </h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', fontFamily: 'sans-serif' }}>
                        <thead>
                            <tr>
                                {dadosImpressao.colunas.map((c, i) => (
                                    <th key={i} style={{ border: '1px solid #000', padding: '6px', textAlign: 'left', background: '#f4f4f5' }}>
                                        {c.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {dadosImpressao.dados.length > 0 ? (
                                dadosImpressao.dados.map((linha, i) => (
                                    <tr key={i}>
                                        {dadosImpressao.colunas.map((c, j) => (
                                            <td key={j} style={{ border: '1px solid #000', padding: '6px' }}>
                                                {linha[c.chave]}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={dadosImpressao.colunas.length} style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}>
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {dadosImpressao.dados.length > 0 && (
                            <tfoot>
                                <tr>
                                    {dadosImpressao.colunas.map((col, colIndex) => {
                                        if (colIndex === 0) return <td key={colIndex} style={tdTotalStyle}>TOTAL:</td>;

                                        if (col.totalizar) {
                                            const soma = dadosImpressao.dados.reduce((acc, linha) => acc + Number(linha[col.chave] || 0), 0);
                                            const isDinheiro = col.chave.includes('valor') || col.chave.includes('faturado') || col.chave.includes('preco') || col.chave.includes('ticket_medio');
                                            return (
                                                <td key={colIndex} style={tdTotalStyle}>
                                                    {isDinheiro ? `R$ ${soma.toFixed(2).replace('.', ',')}` : soma}
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

const tdTotalStyle = { border: '1px solid #000', padding: '6px', fontWeight: 'bold', background: '#f4f4f5' };