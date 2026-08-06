// 'use client'

// import { useState, useEffect } from "react";
// import InputForm from "@/components/ui/inputForm/inputForm.jsx";
// import SelectForm from "@/components/ui/selectForm/selectForm.jsx";
// import { Save, Store, User, MapPin, Printer } from "lucide-react";
// import { useDadosEmpresa } from "@/hooks/useDadosEmpresa.js";
// import { isValidCPF, isValidCNPJ } from "@/utils/validators";
// import styles from "./empresaForm.module.css";
// import Swal from "sweetalert2";

// // --- Funções de Máscara ---
// const mascaraCPF = (v) => v.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4").slice(0, 14);
// // const mascaraCNPJ = (v) => v.replace(/\D/g, "").replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5").slice(0, 18);

// const mascaraCNPJAlfanumerico = (v) => {
//     let r = v.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
//     if (r.length > 12) r = r.replace(/^(.{2})(.{3})(.{3})(.{4})(.{2}).*/, "$1.$2.$3/$4-$5");
//     else if (r.length > 8) r = r.replace(/^(.{2})(.{3})(.{3})(.{0,4}).*/, "$1.$2.$3/$4");
//     else if (r.length > 5) r = r.replace(/^(.{2})(.{3})(.{0,3}).*/, "$1.$2.$3");
//     else if (r.length > 2) r = r.replace(/^(.{2})(.{0,3}).*/, "$1.$2");
//     return r.slice(0, 18);
// };

// const mascaraCEP = (v) => v.replace(/\D/g, "").replace(/(\d{5})(\d{3})/, "$1-$2").slice(0, 9);

// const mascaraTelefone = (v) => {
//     let r = v.replace(/\D/g, "");
//     r = r.replace(/^0/, "");
//     if (r.length > 10) r = r.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
//     else if (r.length > 5) r = r.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
//     else if (r.length > 2) r = r.replace(/^(\d\d)(\d{0,5})/, "($1) $2");
//     return r.slice(0, 15);
// };

// export default function EmpresaForm() {
//     const { dados, loadingDados, saving, carregarDados, salvarDados } = useDadosEmpresa();

//     const [formData, setFormData] = useState({
//         id: null,
//         nome_proprietario: "", cpf_proprietario: "", telefone_proprietario: "",
//         razao_social: "", nome_fantasia: "", cnpj: "", telefone_empresa: "", email_empresa: "", logo_url: "",
//         cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "",
//         imprimir_automaticamente: false, nome_impressora: ""
//     });

//     useEffect(() => {
//         carregarDados();
//     }, [carregarDados]);

//     // useEffect(() => {
//     //     if (dados) {
//     //         setFormData({
//     //             ...dados,
//     //             imprimir_automaticamente: dados.imprimir_automaticamente === 1 || dados.imprimir_automaticamente === true
//     //         });
//     //     }
//     // }, [dados]);

//     if (dados && dados.id !== formData.id) {
//         setFormData({
//             ...dados,
//             imprimir_automaticamente: dados.imprimir_automaticamente === 1 || dados.imprimir_automaticamente === true
//         });
//     }

//     const buscarCEP = async (cep) => {
//         const cepLimpo = cep.replace(/\D/g, '');
//         if (cepLimpo.length !== 8) return;

//         try {
//             const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
//             const data = await res.json();
//             if (!data.erro) {
//                 setFormData(prev => ({
//                     ...prev, logradouro: data.logradouro, bairro: data.bairro, cidade: data.localidade, estado: data.uf
//                 }));
//             }
//         } catch (error) {
//             console.error("Erro ao buscar CEP:", error);
//         }
//     };

//     const handleChange = (e) => {
//         let { name, value, type, checked } = e.target;

//         if (name === 'cpf_proprietario') value = mascaraCPF(value);
//         if (name === 'cnpj') value = mascaraCNPJ(value);
//         if (name === 'telefone_proprietario' || name === 'telefone_empresa') value = mascaraTelefone(value);
//         if (name === 'cep') {
//             value = mascaraCEP(value);
//             if (value.length === 9) buscarCEP(value);
//         }

//         const finalValue = type === 'checkbox' ? checked : value;
//         setFormData(prev => ({ ...prev, [name]: finalValue }));
//     };

//     const handleSelectChange = (e) => {
//         const { name, value } = e.target;
//         if (name === 'imprimir_automaticamente') {
//             setFormData(prev => ({ ...prev, [name]: value === 'true' }));
//         } else {
//             setFormData(prev => ({ ...prev, [name]: value }));
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

        
//         // Valida CPF (Opcional - só valida se o campo não estiver vazio)
//         if (formData.cpf_proprietario && formData.cpf_proprietario.replace(/\D/g, '') !== "") {
//             if (!isValidCPF(formData.cpf_proprietario)) {
//                 Swal.fire({
//                     title: 'CPF Inválido',
//                     text: 'O CPF do proprietário parece estar incorreto.',
//                     icon: 'warning',
//                     confirmButtonColor: '#ea580c'
//                 });
//                 return; // Bloqueia a execução aqui
//             }
//         }
        
//         if (!isValidCNPJ(formData.cnpj)) {
//             Swal.fire({
//                 title: 'CNPJ Inválido',
//                 text: 'Por favor, verifique o CNPJ digitado.',
//                 icon: 'warning',
//                 confirmButtonColor: '#ea580c'
//             });
//             return; // Bloqueia a execução aqui
//         }

//         await salvarDados(formData);
//     };

//     if (loadingDados) return <p className={styles.loadingText}>Carregando dados da empresa...</p>;

//     return (
//         <form onSubmit={handleSubmit} className={styles.formContainer}>
//             <fieldset className={styles.cardSection}>
//                 <legend><User size={18} /> Dados do Proprietário</legend>
//                 <div className={styles.gridContainer}>
//                     <InputForm label="Nome Completo *" name="nome_proprietario" value={formData.nome_proprietario} onChange={handleChange} required />
//                     <InputForm label="CPF" name="cpf_proprietario" value={formData.cpf_proprietario} onChange={handleChange} placeholder="000.000.000-00" />
//                     <InputForm label="Telefone/WhatsApp" name="telefone_proprietario" value={formData.telefone_proprietario} onChange={handleChange} placeholder="(00) 00000-0000" />
//                 </div>
//             </fieldset>

//             <fieldset className={styles.cardSection}>
//                 <legend><Store size={18} /> Dados da Empresa</legend>
//                 <div className={styles.gridContainer}>
//                     <InputForm label="Razão Social *" name="razao_social" value={formData.razao_social} onChange={handleChange} required />
//                     <InputForm label="Nome Fantasia *" name="nome_fantasia" value={formData.nome_fantasia} onChange={handleChange} required />
//                     <InputForm label="CNPJ *" name="cnpj" value={formData.cnpj} onChange={handleChange} placeholder="00.000.000/0000-00" required />
//                     <InputForm label="Telefone do Delivery *" name="telefone_empresa" value={formData.telefone_empresa} onChange={handleChange} placeholder="(00) 00000-0000" required />
//                     <InputForm label="E-mail" name="email_empresa" type="email" value={formData.email_empresa} onChange={handleChange} placeholder="contato@empresa.com" />
//                 </div>
//             </fieldset>

//             <fieldset className={styles.cardSection}>
//                 <legend><MapPin size={18} /> Endereço</legend>
//                 <div className={styles.gridContainer}>
//                     <div style={{ gridColumn: 'span 1' }}>
//                         <InputForm label="CEP *" name="cep" value={formData.cep} onChange={handleChange} placeholder="00000-000" required />
//                     </div>
//                     <div style={{ gridColumn: 'span 2' }}>
//                         <InputForm label="Logradouro (Rua/Av) *" name="logradouro" value={formData.logradouro} onChange={handleChange} required />
//                     </div>
//                     <InputForm label="Número *" name="numero" value={formData.numero} onChange={handleChange} required />
//                     <InputForm label="Complemento" name="complemento" value={formData.complemento} onChange={handleChange} placeholder="Sala, Loja, etc." />
//                     <InputForm label="Bairro *" name="bairro" value={formData.bairro} onChange={handleChange} required />
//                     <InputForm label="Cidade *" name="cidade" value={formData.cidade} onChange={handleChange} required />
//                     <InputForm label="Estado (UF) *" name="estado" value={formData.estado} onChange={handleChange} required placeholder="Ex: SP" maxLength={2} />
//                 </div>
//             </fieldset>

//             <fieldset className={styles.cardSection}>
//                 <legend><Printer size={18} /> Impressão de Cupons</legend>
//                 <div className={styles.gridContainer}>
//                     <SelectForm
//                         label="Imprimir Pedidos Automaticamente?"
//                         name="imprimir_automaticamente"
//                         options={[
//                             { value: "false", label: "Não (Impressão Manual)" },
//                             { value: "true", label: "Sim (Via QZ Tray)" }
//                         ]}
//                         value={String(formData.imprimir_automaticamente)}
//                         onChange={handleSelectChange}
//                     />

//                     {formData.imprimir_automaticamente && (
//                         <div style={{ gridColumn: 'span 2' }}>
//                             <InputForm
//                                 label="Nome da Impressora no Sistema *"
//                                 name="nome_impressora"
//                                 value={formData.nome_impressora}
//                                 onChange={handleChange}
//                                 placeholder="Ex: EPSON TM-T20"
//                                 required={formData.imprimir_automaticamente}
//                             />
//                         </div>
//                     )}
//                 </div>
//             </fieldset>

//             <div className={styles.actions}>
//                 <button type="submit" className={styles.btnSave} disabled={saving}>
//                     {saving ? "Salvando..." : <><Save size={18} style={{ marginRight: 8 }} /> Salvar Configurações</>}
//                 </button>
//             </div>
//         </form>
//     );
// }

'use client'

import { useState, useEffect } from "react";
import InputForm from "@/components/ui/inputForm/inputForm.jsx";
import SelectForm from "@/components/ui/selectForm/selectForm.jsx";
import { Save, Store, User, MapPin, Printer } from "lucide-react";
import { useDadosEmpresa } from "@/hooks/useDadosEmpresa.js";
import { isValidCPF, isValidCNPJ } from "@/utils/validators";
import styles from "./empresaForm.module.css";
import Swal from "sweetalert2";

// ==========================================
// FUNÇÕES DE MÁSCARA
// ==========================================

const mascaraCPF = (v) => {
    return v
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
        .slice(0, 14);
};

const mascaraCNPJAlfanumerico = (v) => {
    let r = v.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    
    if (r.length > 12) {
        r = r.replace(/^(.{2})(.{3})(.{3})(.{4})(.{2}).*/, "$1.$2.$3/$4-$5");
    } else if (r.length > 8) {
        r = r.replace(/^(.{2})(.{3})(.{3})(.{0,4}).*/, "$1.$2.$3/$4");
    } else if (r.length > 5) {
        r = r.replace(/^(.{2})(.{3})(.{0,3}).*/, "$1.$2.$3");
    } else if (r.length > 2) {
        r = r.replace(/^(.{2})(.{0,3}).*/, "$1.$2");
    }
    
    return r.slice(0, 18);
};

const mascaraCEP = (v) => {
    return v
        .replace(/\D/g, "")
        .replace(/(\d{5})(\d{3})/, "$1-$2")
        .slice(0, 9);
};

const mascaraTelefone = (v) => {
    let r = v.replace(/\D/g, "");
    r = r.replace(/^0/, "");
    
    if (r.length > 10) {
        r = r.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
    } else if (r.length > 5) {
        r = r.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    } else if (r.length > 2) {
        r = r.replace(/^(\d\d)(\d{0,5})/, "($1) $2");
    }
    
    return r.slice(0, 15);
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function EmpresaForm() {
    const { dados, loadingDados, saving, carregarDados, salvarDados } = useDadosEmpresa();

    const [formData, setFormData] = useState({
        id: null,
        nome_proprietario: "", 
        cpf_proprietario: "", 
        telefone_proprietario: "",
        razao_social: "", 
        nome_fantasia: "", 
        cnpj: "", 
        telefone_empresa: "", 
        email_empresa: "", 
        logo_url: "",
        cep: "", 
        logradouro: "", 
        numero: "", 
        complemento: "", 
        bairro: "", 
        cidade: "", 
        estado: "",
        imprimir_automaticamente: false, 
        nome_impressora: ""
    });

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    // Derived State para atualizar o formulário assim que a API responder
    if (dados && dados.id !== formData.id) {
        setFormData({
            ...dados,
            imprimir_automaticamente: dados.imprimir_automaticamente === 1 || dados.imprimir_automaticamente === true
        });
    }

    // ==========================================
    // HANDLERS E FUNÇÕES AUXILIARES
    // ==========================================

    const buscarCEP = async (cep) => {
        const cepLimpo = cep.replace(/\D/g, '');
        if (cepLimpo.length !== 8) return;

        try {
            const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await res.json();
            
            if (!data.erro) {
                setFormData(prev => ({
                    ...prev, 
                    logradouro: data.logradouro, 
                    bairro: data.bairro, 
                    cidade: data.localidade, 
                    estado: data.uf
                }));
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        }
    };

    const handleChange = (e) => {
        let { name, value, type, checked } = e.target;

        if (name === 'cpf_proprietario') value = mascaraCPF(value);
        if (name === 'cnpj') value = mascaraCNPJAlfanumerico(value);
        if (name === 'telefone_proprietario' || name === 'telefone_empresa') value = mascaraTelefone(value);
        
        if (name === 'cep') {
            value = mascaraCEP(value);
            if (value.length === 9) buscarCEP(value);
        }

        const finalValue = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'imprimir_automaticamente') {
            setFormData(prev => ({ ...prev, [name]: value === 'true' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Valida CPF (Opcional - só valida se o campo não estiver vazio)
        if (formData.cpf_proprietario && formData.cpf_proprietario.replace(/\D/g, '') !== "") {
            if (!isValidCPF(formData.cpf_proprietario)) {
                Swal.fire({
                    title: 'CPF Inválido',
                    text: 'O CPF do proprietário parece estar incorreto.',
                    icon: 'warning',
                    confirmButtonColor: '#ea580c'
                });
                return; 
            }
        }
        
        // Valida CNPJ apenas se estiver preenchido (Opcional)
        if (formData.cnpj && formData.cnpj.replace(/[^a-zA-Z0-9]/g, '') !== "") {
            if (!isValidCNPJ(formData.cnpj)) {
                Swal.fire({
                    title: 'CNPJ Inválido',
                    text: 'Por favor, verifique o CNPJ digitado.',
                    icon: 'warning',
                    confirmButtonColor: '#ea580c'
                });
                return;
            }
        }

        await salvarDados(formData);
    };

    // ==========================================
    // RENDERIZAÇÃO
    // ==========================================

    if (loadingDados) {
        return <p className={styles.loadingText}>Carregando dados da empresa...</p>;
    }

    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            
            {/* --- SEÇÃO 1: DADOS DO PROPRIETÁRIO --- */}
            <fieldset className={styles.cardSection}>
                <legend><User size={18} /> Dados do Proprietário</legend>
                <div className={styles.gridContainer}>
                    <InputForm 
                        label="Nome Completo *" 
                        name="nome_proprietario" 
                        value={formData.nome_proprietario} 
                        onChange={handleChange} 
                        required 
                    />
                    <InputForm 
                        label="CPF" 
                        name="cpf_proprietario" 
                        value={formData.cpf_proprietario} 
                        onChange={handleChange} 
                        placeholder="000.000.000-00" 
                    />
                    <InputForm 
                        label="Telefone/WhatsApp" 
                        name="telefone_proprietario" 
                        value={formData.telefone_proprietario} 
                        onChange={handleChange} 
                        placeholder="(00) 00000-0000" 
                    />
                </div>
            </fieldset>

            {/* --- SEÇÃO 2: DADOS DA EMPRESA --- */}
            <fieldset className={styles.cardSection}>
                <legend><Store size={18} /> Dados da Empresa</legend>
                <div className={styles.gridContainer}>
                    <InputForm 
                        label="Razão Social *" 
                        name="razao_social" 
                        value={formData.razao_social} 
                        onChange={handleChange} 
                        required 
                    />
                    <InputForm 
                        label="Nome Fantasia *" 
                        name="nome_fantasia" 
                        value={formData.nome_fantasia} 
                        onChange={handleChange} 
                        required 
                    />
                    <InputForm 
                        label="CNPJ" 
                        name="cnpj" 
                        value={formData.cnpj} 
                        onChange={handleChange} 
                        placeholder="00.000.000/0000-00" 
                    />
                    <InputForm 
                        label="Telefone do Delivery *" 
                        name="telefone_empresa" 
                        value={formData.telefone_empresa} 
                        onChange={handleChange} 
                        placeholder="(00) 00000-0000" 
                        required 
                    />
                    <InputForm 
                        label="E-mail" 
                        name="email_empresa" 
                        type="email" 
                        value={formData.email_empresa} 
                        onChange={handleChange} 
                        placeholder="contato@empresa.com" 
                    />
                </div>
            </fieldset>

            {/* --- SEÇÃO 3: ENDEREÇO --- */}
            <fieldset className={styles.cardSection}>
                <legend><MapPin size={18} /> Endereço</legend>
                <div className={styles.gridContainer}>
                    <div style={{ gridColumn: 'span 1' }}>
                        <InputForm 
                            label="CEP *" 
                            name="cep" 
                            value={formData.cep} 
                            onChange={handleChange} 
                            placeholder="00000-000" 
                            required 
                        />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <InputForm 
                            label="Logradouro (Rua/Av) *" 
                            name="logradouro" 
                            value={formData.logradouro} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <InputForm 
                        label="Número *" 
                        name="numero" 
                        value={formData.numero} 
                        onChange={handleChange} 
                        required 
                    />
                    <InputForm 
                        label="Complemento" 
                        name="complemento" 
                        value={formData.complemento} 
                        onChange={handleChange} 
                        placeholder="Sala, Loja, etc." 
                    />
                    <InputForm 
                        label="Bairro *" 
                        name="bairro" 
                        value={formData.bairro} 
                        onChange={handleChange} 
                        required 
                    />
                    <InputForm 
                        label="Cidade *" 
                        name="cidade" 
                        value={formData.cidade} 
                        onChange={handleChange} 
                        required 
                    />
                    <InputForm 
                        label="Estado (UF) *" 
                        name="estado" 
                        value={formData.estado} 
                        onChange={handleChange} 
                        required 
                        placeholder="Ex: SP" 
                        maxLength={2} 
                    />
                </div>
            </fieldset>

            {/* --- SEÇÃO 4: IMPRESSÃO DE CUPONS --- */}
            <fieldset className={styles.cardSection}>
                <legend><Printer size={18} /> Impressão de Cupons</legend>
                <div className={styles.gridContainer}>
                    <SelectForm
                        label="Imprimir Pedidos Automaticamente?"
                        name="imprimir_automaticamente"
                        options={[
                            { value: "false", label: "Não (Impressão Manual)" },
                            { value: "true", label: "Sim (Via QZ Tray)" }
                        ]}
                        value={String(formData.imprimir_automaticamente)}
                        onChange={handleSelectChange}
                    />

                    {formData.imprimir_automaticamente && (
                        <div style={{ gridColumn: 'span 2' }}>
                            <InputForm
                                label="Nome da Impressora no Sistema *"
                                name="nome_impressora"
                                value={formData.nome_impressora}
                                onChange={handleChange}
                                placeholder="Ex: EPSON TM-T20"
                                required={formData.imprimir_automaticamente}
                            />
                        </div>
                    )}
                </div>
            </fieldset>

            {/* --- AÇÕES DO FORMULÁRIO --- */}
            <div className={styles.actions}>
                <button type="submit" className={styles.btnSave} disabled={saving}>
                    {saving ? "Salvando..." : (
                        <>
                            <Save size={18} style={{ marginRight: 8 }} /> 
                            Salvar Configurações
                        </>
                    )}
                </button>
            </div>
            
        </form>
    );
}