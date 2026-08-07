

// import * as XLSX from "xlsx";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";


// const ehCampoDinheiro = (chave = "") =>
//     chave.includes("valor") ||
//     chave.includes("faturado") ||
//     chave.includes("total") ||
//     chave.includes("faturamento") ||
//     chave.includes("preco") ||
//     chave.includes("ticket_medio");

// const formatarValor = (valor, chave) => {
//     if (ehCampoDinheiro(chave) && valor != null) {
//         return `R$ ${Number(valor).toFixed(2).replace(".", ",")}`;
//     }

//     return valor;
// };

// const calcularTotais = (colunas, dados) => {
//     const temTotal = colunas.some(col => col.totalizar);

//     if (!temTotal || !dados?.length) return null;

//     const totais = {};

//     colunas.forEach((col, index) => {

//         if (index === 0) {
//             totais[col.label] = "TOTAL:";
//             return;
//         }

//         if (!col.totalizar) {
//             totais[col.label] = "-";
//             return;
//         }

//         const soma = dados.reduce(
//             (acc, row) => acc + Number(row[col.chave] || 0),
//             0
//         );

//         totais[col.label] = ehCampoDinheiro(col.chave)
//             ? `R$ ${soma.toFixed(2).replace(".", ",")}`
//             : soma;
//     });

//     return totais;
// };

// export const gerarExcel = (relatorio) => {
//     try {

//         const { nome, colunas, dados } = relatorio;

//         const excelData = dados.map(row => {

//             const novaLinha = {};

//             colunas.forEach(col => {
//                 novaLinha[col.label] = formatarValor(row[col.chave], col.chave);
//             });

//             return novaLinha;
//         });

//         const totais = calcularTotais(colunas, dados);

//         if (totais) {
//             excelData.push(totais);
//         }

//         const worksheet = XLSX.utils.json_to_sheet(excelData);

//         const workbook = XLSX.utils.book_new();

//         XLSX.utils.book_append_sheet(
//             workbook,
//             worksheet,
//             "Relatório"
//         );

//         XLSX.writeFile(
//             workbook,
//             `${nome.replace(/\s+/g, "_")}.xlsx`
//         );

//     } catch (error) {

//         console.error(error);

//         throw new Error("Erro ao gerar Excel.");
//     }
// };

// export const gerarPDF = (relatorio) => {

//     try {

//         const { nome, colunas, dados } = relatorio;

//         const doc = new jsPDF("landscape");

//         doc.setFontSize(16);
//         doc.text(nome, 14, 15);

//         const tableColumns = colunas.map(col => col.label);

//         const bodyRows = dados.map(row =>
//             colunas.map(col =>
//                 formatarValor(row[col.chave], col.chave)
//             )
//         );

//         const totais = calcularTotais(colunas, dados);

//         const footRows = totais
//             ? [colunas.map(col => totais[col.label] ?? "-")]
//             : [];

//         // autoTable(doc, {

//         //     head: [tableColumns],

//         //     body: bodyRows,

//         //     foot: footRows,

//         //     startY: 20,

//         //     theme: "striped",

//         //     showFoot: totais ? "lastPage" : "never",

//         //     styles: {
//         //         fontSize: 9,
//         //         cellPadding: 3
//         //     },

//         //     alternateRowStyles: {
//         //         fillColor: [248, 248, 248],
//         //     },

//         //     bodyStyles: {
//         //         fillColor: [255, 255, 255], // linhas ímpares
//         //     },

//         //     headStyles: {
//         //         fillColor: [234, 88, 12],
//         //         textColor: 255,
//         //         fontStyle: "bold"
//         //     },

//         //     footStyles: {
//         //         fillColor: [255, 184, 145],
//         //         textColor: 0,
//         //         fontStyle: "bold"
//         //     }
//         // });

//         autoTable(doc, {
//             head: [tableColumns],
//             body: bodyRows,
//             foot: footRows,

//             startY: 22,
//             theme: "grid",

//             styles: {
//                 font: "helvetica",
//                 fontSize: 9,
//                 cellPadding: 4,
//                 lineColor: [209, 213, 219], // #d1d5db
//                 lineWidth: 0.2,
//                 textColor: [55, 65, 81], // #374151
//             },

//             headStyles: {
//                 fillColor: [31, 41, 55], // #1f2937
//                 textColor: [255, 255, 255],
//                 fontStyle: "bold",
//                 fontSize: 10,
//             },

//             bodyStyles: {
//                 fillColor: [255, 255, 255],
//             },

//             alternateRowStyles: {
//                 fillColor: [248, 250, 252], // #f8fafc
//             },

//             footStyles: {
//                 fillColor: [229, 231, 235], // #e5e7eb
//                 textColor: [17, 24, 39],    // #111827
//                 fontStyle: "bold",
//                 lineColor: [156, 163, 175], // #9ca3af
//                 lineWidth: 0.3,
//             },

//             showFoot: footRows.length ? "lastPage" : "never",
//         });

//         doc.save(`${nome.replace(/\s+/g, "_")}.pdf`);

//     } catch (error) {

//         console.error(error);

//         throw new Error("Erro ao gerar PDF.");
//     }
// };


import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Campos que representam valores monetários.
 * Não utilize includes(), pois "data_faturamento"
 * também contém "faturamento".
 */
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
    "troco"
];

const ehCampoDinheiro = (chave = "") =>
    CAMPOS_DINHEIRO.includes(chave);

const formatarValor = (valor, chave) => {

    if (valor == null) return "";

    if (ehCampoDinheiro(chave)) {
        return `R$ ${Number(valor).toFixed(2).replace(".", ",")}`;
    }

    return valor;
};

const calcularTotais = (colunas, dados) => {

    const temTotal = colunas.some(col => col.totalizar);

    if (!temTotal || !dados?.length) return null;

    const totais = {};

    colunas.forEach((col, index) => {

        if (index === 0) {
            totais[col.label] = "TOTAL:";
            return;
        }

        if (!col.totalizar) {
            totais[col.label] = "-";
            return;
        }

        const soma = dados.reduce(
            (acc, row) => acc + Number(row[col.chave] || 0),
            0
        );

        totais[col.label] = ehCampoDinheiro(col.chave)
            ? `R$ ${soma.toFixed(2).replace(".", ",")}`
            : soma;
    });

    return totais;
};

export const gerarExcel = (relatorio) => {

    try {

        const { nome, colunas, dados } = relatorio;

        const excelData = dados.map(row => {

            const novaLinha = {};

            colunas.forEach(col => {
                novaLinha[col.label] = formatarValor(
                    row[col.chave],
                    col.chave
                );
            });

            return novaLinha;
        });

        const totais = calcularTotais(colunas, dados);

        if (totais) {
            excelData.push(totais);
        }

        const worksheet = XLSX.utils.json_to_sheet(excelData);

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Relatório"
        );

        XLSX.writeFile(
            workbook,
            `${nome.replace(/\s+/g, "_")}.xlsx`
        );

    } catch (error) {

        console.error(error);

        throw new Error("Erro ao gerar Excel.");
    }
};

export const gerarPDF = (relatorio) => {

    try {

        const { nome, colunas, dados, filtros_aplicados } = relatorio;

        const doc = new jsPDF("landscape");

        // 2. Escrevemos o Título Principal
        doc.setFontSize(16);
        doc.text(nome, 14, 15);

        // Criamos uma variável para controlar a altura que a tabela vai começar
        let tableStartY = 22;

        // 3. Se existirem filtros aplicados, escrevemos eles debaixo do título
        // if (filtros_aplicados) {
        //     doc.setFontSize(10);
        //     doc.setTextColor(75, 85, 99); // Um cinza escuro elegante

        //     if (filtros_aplicados.data_inicio || filtros_aplicados.data_fim) {
        //         const dataInicio = filtros_aplicados.data_inicio 
        //             ? filtros_aplicados.data_inicio.split('-').reverse().join('/') 
        //             : 'Início';
        //         const dataFim = filtros_aplicados.data_fim 
        //             ? filtros_aplicados.data_fim.split('-').reverse().join('/') 
        //             : 'Hoje';

        //         doc.text(`Período: ${dataInicio} até ${dataFim}`, 14, tableStartY);
        //         tableStartY += 6; // Empurra a tabela 6px para baixo
        //     }

        //     if (filtros_aplicados.status) {
        //         // Capitaliza a primeira letra do status
        //         const statusFormatado = filtros_aplicados.status.charAt(0).toUpperCase() + filtros_aplicados.status.slice(1);
        //         doc.text(`Status: ${statusFormatado}`, 14, tableStartY);
        //         tableStartY += 6; // Empurra a tabela mais 6px para baixo
        //     }

        //     // Dá uma margem extra de respiro antes da tabela começar
        //     if (filtros_aplicados.data_inicio || filtros_aplicados.data_fim || filtros_aplicados.status) {
        //         tableStartY += 2;
        //     }
        // }

        if (filtros_aplicados) {
            doc.setFontSize(10);
            doc.setTextColor(75, 85, 99); // Um cinza escuro elegante

            // 3.1 Trata as datas primeiro (se existirem)
            if (filtros_aplicados.data_inicio || filtros_aplicados.data_fim) {
                const dataInicio = filtros_aplicados.data_inicio
                    ? filtros_aplicados.data_inicio.split('-').reverse().join('/')
                    : 'Início';
                const dataFim = filtros_aplicados.data_fim
                    ? filtros_aplicados.data_fim.split('-').reverse().join('/')
                    : 'Hoje';

                doc.text(`Período: ${dataInicio} até ${dataFim}`, 14, tableStartY);
                tableStartY += 6;
            }

            // 3.2 Loop DINÂMICO para qualquer outro filtro que não seja data
            Object.entries(filtros_aplicados).forEach(([chave, valor]) => {
                // Pula as datas (já tratadas) e valores vazios
                if (chave === 'data_inicio' || chave === 'data_fim' || !valor) return;

                // Transforma "tipo_entrega" em "Tipo Entrega"
                const labelFormatada = chave.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                // Formata o valor com a primeira letra maiúscula
                const valorFormatado = String(valor).charAt(0).toUpperCase() + String(valor).slice(1);

                doc.text(`${labelFormatada}: ${valorFormatado}`, 14, tableStartY);
                tableStartY += 6;
            });

            // Margem extra antes da tabela
            if (Object.keys(filtros_aplicados).length > 0) {
                tableStartY += 2;
            }
        }

        const tableColumns = colunas.map(col => col.label);

        const bodyRows = dados.map(row =>
            colunas.map(col =>
                formatarValor(
                    row[col.chave],
                    col.chave
                )
            )
        );

        const totais = calcularTotais(colunas, dados);

        const footRows = totais
            ? [colunas.map(col => totais[col.label] ?? "-")]
            : [];

        autoTable(doc, {
            head: [tableColumns],
            body: bodyRows,
            foot: footRows,

            startY: tableStartY,
            theme: "grid",

            styles: {
                font: "helvetica",
                fontSize: 9,
                cellPadding: 4,
                lineColor: [209, 213, 219],
                lineWidth: 0.2,
                textColor: [55, 65, 81],
            },

            headStyles: {
                fillColor: [31, 41, 55],
                textColor: [255, 255, 255],
                fontStyle: "bold",
                fontSize: 10,
            },

            bodyStyles: {
                fillColor: [255, 255, 255],
            },

            alternateRowStyles: {
                fillColor: [248, 250, 252],
            },

            footStyles: {
                fillColor: [229, 231, 235],
                textColor: [17, 24, 39],
                fontStyle: "bold",
                lineColor: [156, 163, 175],
                lineWidth: 0.3,
            },

            showFoot: footRows.length ? "lastPage" : "never",
        });

        doc.save(`${nome.replace(/\s+/g, "_")}.pdf`);

    } catch (error) {

        console.error(error);

        throw new Error("Erro ao gerar PDF.");
    }
};