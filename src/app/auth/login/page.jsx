'use client'

import { useState } from "react"

import { useLogin } from "@/hooks/useLogin.js"

import { ChefHat, Lock, Mail, Eye, EyeOff } from "lucide-react"

import styles from './page.module.css'

export default function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [showPassword, setShowPassword] = useState(false);

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
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className={styles.eyeButton}
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1" // Evita que o tab pare no ícone antes do botão de login
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
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