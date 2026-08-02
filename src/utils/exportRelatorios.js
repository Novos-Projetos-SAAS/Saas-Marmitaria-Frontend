// import * as XLSX from 'xlsx';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable'; // Importação corrigida para Next.js

// const calcularTotais = (colunas, dados) => {
//     const temTotal = colunas.some(c => c.totalizar);
//     if (!temTotal || !dados || dados.length === 0) return null;

//     const rowTotal = {};
//     colunas.forEach((col, idx) => {
//         if (idx === 0) {
//             rowTotal[col.label] = 'TOTAL:';
//         } else if (col.totalizar) {
//             const soma = dados.reduce((acc, curr) => acc + Number(curr[col.chave] || 0), 0);
//             const isDinheiro = col.chave.includes('valor') || col.chave.includes('faturado') || col.chave.includes('preco') || col.chave.includes('ticket_medio');
//             rowTotal[col.label] = isDinheiro ? `R$ ${soma.toFixed(2).replace('.', ',')}` : soma;
//         } else {
//             rowTotal[col.label] = '-';
//         }
//     });
//     return rowTotal;
// };

// export const gerarExcel = (relatorio) => {
//     try {
//         const { nome, colunas, dados } = relatorio;

//         const excelData = dados.map(row => {
//             const newRow = {};
//             colunas.forEach(col => {
//                 newRow[col.label] = row[col.chave];
//             });
//             return newRow;
//         });

//         const totais = calcularTotais(colunas, dados);
//         if (totais) excelData.push(totais);

//         const worksheet = XLSX.utils.json_to_sheet(excelData);
//         const workbook = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório");

//         XLSX.writeFile(workbook, `${nome.replace(/\s+/g, '_')}.xlsx`);
//     } catch (error) {
//         console.error("Erro ao gerar Excel:", error);
//         throw new Error("Falha na geração do Excel.");
//     }
// };

// export const gerarPDF = (relatorio) => {
//     try {
//         const { nome, colunas, dados } = relatorio;
//         const doc = new jsPDF('landscape');

//         doc.setFontSize(16);
//         doc.text(nome, 14, 15);

//         const tableColumns = colunas.map(col => col.label);
//         // const tableRows = dados.map(row => colunas.map(col => row[col.chave]));

//         const tableRows = dados.map(row => colunas.map(col => {
//             const valor = row[col.chave];
//             const isDinheiro = col.chave.includes('valor') || col.chave.includes('faturado') || col.chave.includes('preco') || col.chave.includes('ticket_medio');

//             return isDinheiro && valor != null
//                 ? `R$ ${Number(valor).toFixed(2).replace('.', ',')}`
//                 : valor;
//         }));

//         const totais = calcularTotais(colunas, dados);
//         if (totais) {
//             tableRows.push(colunas.map(col => totais[col.label] || '-'));
//         }

//         // Uso corrigido do autoTable
//         autoTable(doc, {
//             head: [tableColumns],
//             body: tableRows,
//             startY: 20,
//             theme: 'striped',
//             styles: { fontSize: 9 },
//             headStyles: { fillColor: [234, 88, 12] },
//             // footStyles: { fillColor: [244, 244, 245], textColor: 20, fontStyle: 'bold' },
//             // O array [234, 88, 12] é o código RGB exato da cor #ea580c
//             footStyles: { fillColor: [234, 88, 12], textColor: 255, fontStyle: 'bold' },
//             showFoot: totais ? 'lastPage' : false,
//         });

//         doc.save(`${nome.replace(/\s+/g, '_')}.pdf`);
//     } catch (error) {
//         console.error("Erro ao gerar PDF:", error);
//         throw new Error("Falha na geração do PDF.");
//     }
// };

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ehCampoDinheiro = (chave = "") =>
    chave.includes("valor") ||
    chave.includes("faturado") ||
    chave.includes("total") ||
    chave.includes("faturamento") ||
    chave.includes("preco") ||
    chave.includes("ticket_medio");

const formatarValor = (valor, chave) => {
    if (ehCampoDinheiro(chave) && valor != null) {
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
                novaLinha[col.label] = formatarValor(row[col.chave], col.chave);
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

        const { nome, colunas, dados } = relatorio;

        const doc = new jsPDF("landscape");

        doc.setFontSize(16);
        doc.text(nome, 14, 15);

        const tableColumns = colunas.map(col => col.label);

        const bodyRows = dados.map(row =>
            colunas.map(col =>
                formatarValor(row[col.chave], col.chave)
            )
        );

        const totais = calcularTotais(colunas, dados);

        const footRows = totais
            ? [colunas.map(col => totais[col.label] ?? "-")]
            : [];

        // autoTable(doc, {

        //     head: [tableColumns],

        //     body: bodyRows,

        //     foot: footRows,

        //     startY: 20,

        //     theme: "striped",

        //     showFoot: totais ? "lastPage" : "never",

        //     styles: {
        //         fontSize: 9,
        //         cellPadding: 3
        //     },

        //     alternateRowStyles: {
        //         fillColor: [248, 248, 248],
        //     },

        //     bodyStyles: {
        //         fillColor: [255, 255, 255], // linhas ímpares
        //     },

        //     headStyles: {
        //         fillColor: [234, 88, 12],
        //         textColor: 255,
        //         fontStyle: "bold"
        //     },

        //     footStyles: {
        //         fillColor: [255, 184, 145],
        //         textColor: 0,
        //         fontStyle: "bold"
        //     }
        // });

        autoTable(doc, {
            head: [tableColumns],
            body: bodyRows,
            foot: footRows,

            startY: 22,
            theme: "grid",

            styles: {
                font: "helvetica",
                fontSize: 9,
                cellPadding: 4,
                lineColor: [209, 213, 219], // #d1d5db
                lineWidth: 0.2,
                textColor: [55, 65, 81], // #374151
            },

            headStyles: {
                fillColor: [31, 41, 55], // #1f2937
                textColor: [255, 255, 255],
                fontStyle: "bold",
                fontSize: 10,
            },

            bodyStyles: {
                fillColor: [255, 255, 255],
            },

            alternateRowStyles: {
                fillColor: [248, 250, 252], // #f8fafc
            },

            footStyles: {
                fillColor: [229, 231, 235], // #e5e7eb
                textColor: [17, 24, 39],    // #111827
                fontStyle: "bold",
                lineColor: [156, 163, 175], // #9ca3af
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