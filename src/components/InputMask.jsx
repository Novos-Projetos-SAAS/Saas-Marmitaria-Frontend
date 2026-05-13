import { IMaskInput } from "react-imask"

export const TelefoneInput = ({ value, onChange, className, placeholder }) => {
    return (
        <IMaskInput
            mask='(00) 00000-0000'
            value={value || ''}
            onAccept={(value) =>
                onChange({
                    target: {
                        name: 'telefone',
                        value
                    }
                })}
            className={className}
            placeholder={placeholder}
            type='tel'
            required
        />
    )
}