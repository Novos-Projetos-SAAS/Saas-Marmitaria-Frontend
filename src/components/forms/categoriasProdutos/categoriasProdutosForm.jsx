// "use client";

// import {
//     useEffect,
//     useState
// } from "react";

// import {
//     Edit,
//     Save
// } from "lucide-react";

// import InputForm from "@/components/ui/inputForm/inputForm.jsx";

// import Can from "@/components/ui/can/index.jsx";

// /**
//  * Reaproveitamos a mesma estrutura visual
//  * do formulário de produtos.
//  */
// import styles from "../produtos/produtosForm.module.css";


// export default function CategoriasProdutosForm({

//     initialData,

//     mode = "create",

//     onSave,

//     onCancel

// }) {

//     const [
//         loading,
//         setLoading
//     ] = useState(false);


//     const [
//         isEditable,
//         setIsEditable
//     ] = useState(
//         mode === "create" ||
//         mode === "edit"
//     );


//     const [
//         errors,
//         setErrors
//     ] = useState({});


//     const [
//         formData,
//         setFormData
//     ] = useState({

//         id:
//             initialData?.id ||
//             null,

//         nome:
//             initialData?.nome ||
//             "",

//         descricao:
//             initialData?.descricao ||
//             "",

//         ordem_exibicao:
//             initialData
//                 ?.ordem_exibicao ??
//             0,

//         ativo:
//             initialData?.ativo ??
//             true
//     });


//     useEffect(() => {

//         if (!initialData) {
//             return;
//         }


//         setFormData({

//             id:
//                 initialData.id,

//             nome:
//                 initialData.nome ||
//                 "",

//             descricao:
//                 initialData.descricao ||
//                 "",

//             ordem_exibicao:
//                 initialData
//                     .ordem_exibicao ??
//                 0,

//             ativo:
//                 initialData.ativo ??
//                 true
//         });


//         setIsEditable(
//             mode === "edit"
//         );

//     }, [
//         initialData,
//         mode
//     ]);


//     const handleChange = (
//         event
//     ) => {

//         const {
//             name,
//             value
//         } = event.target;


//         setFormData(
//             (
//                 previous
//             ) => ({

//                 ...previous,

//                 [name]:
//                     value
//             })
//         );


//         setErrors(
//             (
//                 previous
//             ) => ({

//                 ...previous,

//                 [name]:
//                     null
//             })
//         );
//     };


//     const validate = () => {

//         const newErrors = {};


//         if (
//             formData.nome
//                 .trim()
//                 .length < 2
//         ) {

//             newErrors.nome =
//                 "Informe um nome válido.";
//         }


//         const ordem =
//             Number(
//                 formData
//                     .ordem_exibicao
//             );


//         if (
//             !Number.isInteger(ordem) ||
//             ordem < 0
//         ) {

//             newErrors
//                 .ordem_exibicao =
//                 "Informe uma ordem válida.";
//         }


//         setErrors(
//             newErrors
//         );


//         return (
//             Object.keys(
//                 newErrors
//             ).length === 0
//         );
//     };


//     const submit =
//         async (
//             event
//         ) => {

//             event.preventDefault();


//             if (!validate()) {
//                 return;
//             }


//             setLoading(true);


//             try {

//                 await onSave({

//                     nome:
//                         formData.nome
//                             .trim(),

//                     descricao:
//                         formData
//                             .descricao
//                             .trim() ||
//                         null,

//                     ordem_exibicao:
//                         Number(
//                             formData
//                                 .ordem_exibicao
//                         ),

//                     ativo:
//                         formData.ativo
//                 });

//             } finally {

//                 setLoading(
//                     false
//                 );
//             }
//         };


//     return (

//         <form
//             className={
//                 styles.form
//             }
//             onSubmit={
//                 submit
//             }
//         >

//             {formData.id && (

//                 <div
//                     className={
//                         styles.fullWidth
//                     }
//                 >

//                     <InputForm
//                         label="ID da Categoria"
//                         name="id"
//                         value={
//                             formData.id
//                         }
//                         disabled
//                     />

//                 </div>
//             )}


//             <InputForm
//                 label="Nome da Categoria"
//                 name="nome"
//                 placeholder="Ex: Bebidas, Sobremesas"
//                 value={
//                     formData.nome
//                 }
//                 onChange={
//                     handleChange
//                 }
//                 disabled={
//                     !isEditable
//                 }
//                 error={
//                     errors.nome
//                 }
//             />


//             <InputForm
//                 label="Ordem de Exibição"
//                 name="ordem_exibicao"
//                 type="number"
//                 min="0"
//                 value={
//                     formData
//                         .ordem_exibicao
//                 }
//                 onChange={
//                     handleChange
//                 }
//                 disabled={
//                     !isEditable
//                 }
//                 error={
//                     errors
//                         .ordem_exibicao
//                 }
//             />


//             <div
//                 className={
//                     styles.fullWidth
//                 }
//             >

//                 <div
//                     className={
//                         styles.textareaGroup
//                     }
//                 >

//                     <label
//                         className={
//                             styles.label
//                         }
//                     >
//                         Descrição
//                     </label>


//                     <textarea
//                         name="descricao"
//                         rows="4"
//                         className={
//                             styles.textarea
//                         }
//                         placeholder="Descrição da categoria..."
//                         value={
//                             formData.descricao
//                         }
//                         onChange={
//                             handleChange
//                         }
//                         disabled={
//                             !isEditable
//                         }
//                     />

//                 </div>

//             </div>


//             <div
//                 className={
//                     styles.toggleGrid
//                 }
//             >

//                 <label
//                     className={
//                         styles.toggleCard
//                     }
//                 >

//                     <input
//                         type="checkbox"
//                         checked={
//                             formData.ativo
//                         }
//                         disabled={
//                             !isEditable
//                         }
//                         onChange={() =>
//                             setFormData(
//                                 (
//                                     previous
//                                 ) => ({

//                                     ...previous,

//                                     ativo:
//                                         !previous.ativo
//                                 })
//                             )
//                         }
//                     />


//                     <div>

//                         <strong>
//                             Categoria Ativa
//                         </strong>

//                         <span>
//                             Categorias inativas não aparecem no cardápio.
//                         </span>

//                     </div>

//                 </label>

//             </div>


//             <div
//                 className={
//                     styles.actions
//                 }
//             >

//                 {!isEditable ? (
//                     <Can
//                         perform="categorias_produtos.editar"
//                     >
//                         <button
//                             type="button"
//                             className={
//                                 styles.btnSave
//                             }
//                             onClick={() =>
//                                 setIsEditable(
//                                     true
//                                 )
//                             }
//                         >

//                             <Edit
//                                 size={16}
//                             />

//                             Editar Dados

//                         </button>
//                     </Can>
//                 ) : (

//                     <>

//                         <button
//                             type="button"
//                             className={
//                                 styles.btnCancel
//                             }
//                             onClick={
//                                 onCancel
//                             }
//                             disabled={
//                                 loading
//                             }
//                         >
//                             Cancelar
//                         </button>


//                         <button
//                             type="submit"
//                             className={
//                                 styles.btnSave
//                             }
//                             disabled={
//                                 loading
//                             }
//                         >

//                             <Save
//                                 size={18}
//                             />

//                             {loading
//                                 ? "Salvando..."
//                                 : mode === "create"
//                                     ? "Cadastrar Categoria"
//                                     : "Salvar Alterações"}

//                         </button>

//                     </>
//                 )}

//             </div>

//         </form>
//     );
// }
"use client";

import { useEffect, useState } from "react";
import { Edit, Save } from "lucide-react";

import InputForm from "@/components/ui/inputForm/inputForm.jsx";
import Can from "@/components/ui/can/index.jsx";

import styles from "../produtos/produtosForm.module.css";

export default function CategoriasProdutosForm({
    initialData,
    mode = "create",
    onSave,
    onCancel
}) {
    const [loading, setLoading] = useState(false);
    const [isEditable, setIsEditable] = useState(mode === "create" || mode === "edit");
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        id: initialData?.id || null,
        nome: initialData?.nome || "",
        descricao: initialData?.descricao || "",
        ordem_exibicao: initialData?.ordem_exibicao ?? 0,
        ativo: initialData?.ativo ?? true
    });

    useEffect(() => {
        if (!initialData) return;

        setFormData({
            id: initialData.id,
            nome: initialData.nome || "",
            descricao: initialData.descricao || "",
            ordem_exibicao: initialData.ordem_exibicao ?? 0,
            ativo: initialData.ativo ?? true
        });

        setIsEditable(mode === "edit");
    }, [initialData, mode]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData(previous => ({
            ...previous,
            [name]: value
        }));

        setErrors(previous => ({
            ...previous,
            [name]: null
        }));
    };

    const validate = () => {
        const newErrors = {};

        if (formData.nome.trim().length < 2) {
            newErrors.nome = "Informe um nome válido.";
        }

        const ordem = Number(formData.ordem_exibicao);

        if (!Number.isInteger(ordem) || ordem < 0) {
            newErrors.ordem_exibicao = "Informe uma ordem válida.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const submit = async (event) => {
        event.preventDefault();

        if (!validate()) return;

        setLoading(true);

        try {
            await onSave({
                nome: formData.nome.trim(),
                descricao: formData.descricao.trim() || null,
                ordem_exibicao: Number(formData.ordem_exibicao),
                ativo: formData.ativo
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className={styles.form} onSubmit={submit}>
            {formData.id && (
                <div className={styles.fullWidth}>
                    <InputForm
                        label="ID da Categoria"
                        name="id"
                        value={formData.id}
                        disabled
                    />
                </div>
            )}

            <InputForm
                label="Nome da Categoria"
                name="nome"
                placeholder="Ex: Bebidas, Sobremesas"
                value={formData.nome}
                onChange={handleChange}
                disabled={!isEditable}
                error={errors.nome}
            />

            <InputForm
                label="Ordem de Exibição"
                name="ordem_exibicao"
                type="number"
                min="0"
                value={formData.ordem_exibicao}
                onChange={handleChange}
                disabled={!isEditable}
                error={errors.ordem_exibicao}
            />

            <div className={styles.fullWidth}>
                <div className={styles.textareaGroup}>
                    <label className={styles.label}>Descrição</label>

                    <textarea
                        name="descricao"
                        rows="4"
                        className={styles.textarea}
                        placeholder="Descrição da categoria..."
                        value={formData.descricao}
                        onChange={handleChange}
                        disabled={!isEditable}
                    />
                </div>
            </div>

            <div className={styles.toggleGrid}>
                <label className={styles.toggleCard}>
                    <input
                        type="checkbox"
                        checked={formData.ativo}
                        disabled={!isEditable}
                        onChange={() => {
                            setFormData(previous => ({
                                ...previous,
                                ativo: !previous.ativo
                            }));
                        }}
                    />

                    <div>
                        <strong>Categoria Ativa</strong>
                        <span>Categorias inativas não aparecem no cardápio.</span>
                    </div>
                </label>
            </div>

            <div className={styles.actions}>
                {!isEditable ? (
                    <Can perform="categorias_produtos.editar">
                        <button
                            type="button"
                            className={styles.btnSave}
                            onClick={() => setIsEditable(true)}
                        >
                            <Edit size={16} />
                            Editar Dados
                        </button>
                    </Can>
                ) : (
                    <>
                        <button
                            type="button"
                            className={styles.btnCancel}
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className={styles.btnSave}
                            disabled={loading}
                        >
                            <Save size={18} />
                            {loading ? "Salvando..." : mode === "create" ? "Cadastrar Categoria" : "Salvar Alterações"}
                        </button>
                    </>
                )}
            </div>
        </form>
    );
}