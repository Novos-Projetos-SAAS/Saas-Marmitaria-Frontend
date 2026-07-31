import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Importação corrigida para Next.js

const calcularTotais = (colunas, dados) => {
    const temTotal = colunas.some(c => c.totalizar);
    if (!temTotal || !dados || dados.length === 0) return null;

    const rowTotal = {};
    colunas.forEach((col, idx) => {
        if (idx === 0) {
            rowTotal[col.label] = 'TOTAL:';
        } else if (col.totalizar) {
            const soma = dados.reduce((acc, curr) => acc + Number(curr[col.chave] || 0), 0);
            const isDinheiro = col.chave.includes('valor') || col.chave.includes('faturado') || col.chave.includes('preco') || col.chave.includes('ticket_medio');
            rowTotal[col.label] = isDinheiro ? `R$ ${soma.toFixed(2).replace('.', ',')}` : soma;
        } else {
            rowTotal[col.label] = '-';
        }
    });
    return rowTotal;
};

export const gerarExcel = (relatorio) => {
    try {
        const { nome, colunas, dados } = relatorio;
        
        const excelData = dados.map(row => {
            const newRow = {};
            colunas.forEach(col => {
                newRow[col.label] = row[col.chave];
            });
            return newRow;
        });

        const totais = calcularTotais(colunas, dados);
        if (totais) excelData.push(totais);

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório");
        
        XLSX.writeFile(workbook, `${nome.replace(/\s+/g, '_')}.xlsx`);
    } catch (error) {
        console.error("Erro ao gerar Excel:", error);
        throw new Error("Falha na geração do Excel.");
    }
};

export const gerarPDF = (relatorio) => {
    try {
        const { nome, colunas, dados } = relatorio;
        const doc = new jsPDF('landscape');
        
        doc.setFontSize(16);
        doc.text(nome, 14, 15);
        
        const tableColumns = colunas.map(col => col.label);
        const tableRows = dados.map(row => colunas.map(col => row[col.chave]));

        const totais = calcularTotais(colunas, dados);
        if (totais) {
            tableRows.push(colunas.map(col => totais[col.label] || '-'));
        }
        
        // Uso corrigido do autoTable
        autoTable(doc, {
            head: [tableColumns],
            body: tableRows,
            startY: 20,
            theme: 'striped',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [234, 88, 12] },
            footStyles: { fillColor: [244, 244, 245], textColor: 20, fontStyle: 'bold' },
            showFoot: totais ? 'lastPage' : false,
        });
        
        doc.save(`${nome.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        throw new Error("Falha na geração do PDF.");
    }
};