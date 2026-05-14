'use client'

import { useState } from "react"

import { useLogin } from "@/hooks/useLogin.js"

import { ChefHat, Lock, Mail } from "lucide-react"

import styles from './page.module.css'

export default function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const { handleLogin, loading } = useLogin();

    const onSubmit = async (e) => {
        e.preventDefault();
        await handleLogin(email, senha);
    }

    return (
        <main className={styles.container}>
            <div className={styles.card}>
                <header className={styles.header}>
                    <div className={styles.logoWrap}>
                        <ChefHat size={36} color="#ffffff" />
                    </div>
                    <h1>Acesso Restrito</h1>
                    <p>Painel Administrativo da Marmitaria</p>
                </header>

                <form onSubmit={onSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">E-mail de acesso</label>
                        <div className={styles.inputWrapper}>
                            <Mail size={20} className={styles.icon} />
                            <input
                                id="email"
                                type="email"
                                placeholder="admin@marmitaria.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="senha">Senha</label>
                        <div className={styles.inputWrapper}>
                            <Lock size={20} className={styles.icon} />
                            <input
                                id="senha"
                                type="password"
                                placeholder="••••••••"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className={styles.btnAcessar} 
                        disabled={loading}
                    >
                        {loading ? 'Verificando credenciais...' : 'Acessar Painel'}
                    </button>
                </form>
            </div>
        </main>
    );
}