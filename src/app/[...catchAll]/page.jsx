import Link from 'next/link';

export default function CatchAllNotFound() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem', fontFamily: 'sans-serif', backgroundColor: '#FAFAFA' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#18181b' }}>404 - Página não encontrada</h2>
            <p style={{ color: '#71717a' }}>A URL que você tentou acessar não existe no sistema.</p>
            
            <Link 
                href="/admin/usuarios" 
                style={{ marginTop: '1rem', padding: '10px 20px', backgroundColor: '#ea580c', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}
            >
                Voltar para o Painel
            </Link>
        </div>
    );
}