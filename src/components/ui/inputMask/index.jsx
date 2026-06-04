// import { IMaskInput } from "react-imask"

// export default function TelefoneInput({ value, onChange, className, placeholder }) {
//     return (
//         <IMaskInput
//             mask='(00) 00000-0000'
//             value={value || ''}
//             onAccept={(value) =>
//                 onChange({
//                     target: {
//                         name: 'telefone',
//                         value
//                     }
//                 })}
//             className={className}
//             placeholder={placeholder}
//             type='tel'
//             required
//         />
//     )
// }

import { IMaskInput } from "react-imask"

export default function TelefoneInput({ 
    name = 'telefone', 
    value, 
    onChange, 
    className, 
    placeholder,
    required = false // 🚀 Deixamos como opcional por padrão
}) {
    return (
        <IMaskInput
            mask='(00) 00000-0000'
            value={value || ''}
            onAccept={(value) =>
                onChange({
                    target: {
                        name: name, // 🚀 Agora usa a prop dinâmica (ex: telefone_cliente)
                        value
                    }
                })
            }
            className={className}
            placeholder={placeholder}
            type='tel'
            required={required}
        />
    )
}