export default function formatarNomeImagem(nome) {
    return nome
        .toLowerCase()
        .normalize("NFD") // Separa as letras dos acentos
        .replace(/[\u0300-\u036f]/g, "") // Remove os acentos
        .replace(/\s+/g, '-') // Troca espaços em branco por hífen
        .replace(/[^a-z0-9-]/g, ''); // Remove qualquer outro caractere especial (como ! ? /)
};