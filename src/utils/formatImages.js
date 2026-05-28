export default function formatarNomeImagem(nome) {

    if (!nome) {
        return null; // ou retorne uma string com uma imagem padrão: return '/placeholder.png';
    }

    return nome
        .toLowerCase()
        .normalize("NFD") // Separa as letras dos acentos
        .replace(/[\u0300-\u036f]/g, "") // Remove os acentos
        .replace(/\s+/g, '-') // Troca espaços em branco por hífen
        .replace(/[^a-z0-9-]/g, ''); // Remove qualquer outro caractere especial (como ! ? /)
};