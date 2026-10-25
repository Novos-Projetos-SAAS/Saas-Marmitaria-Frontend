import { useCallback, useEffect, useState } from 'react';
import { readInfinitepayConfiguration, saveInfinitepayConfiguration } from '@/services/infinitepayConfigurationService.js';

export function useInfinitepayConfiguration() {
    const [configuration,setConfiguration]=useState(null);
    const [form,setForm]=useState({handle:'',ativo:false,assured_installments:1});
    const [apiKey,setApiKey]=useState('');
    const [csrf,setCsrf]=useState('');
    const [available,setAvailable]=useState(false);
    const [saving,setSaving]=useState(false);
    const [message,setMessage]=useState('');
    const [error,setError]=useState('');
    const apply=useCallback(result=>{
        setConfiguration(result.data);setForm({handle:result.data.handle || '',ativo:result.data.ativo,assured_installments:result.data.assured_installments});
        setCsrf(result.csrf_token);setAvailable(result.activation_available===true);
    },[]);
    const refresh=useCallback(()=>readInfinitepayConfiguration().then(apply),[apply]);
    useEffect(()=>{
        let active=true;
        readInfinitepayConfiguration().then(result=>{if(active) apply(result);})
            .catch(()=>{if(active) setError('Não foi possível consultar a configuração InfinitePay.');});
        return ()=>{active=false;};
    },[apply]);
    async function save(event) {
        event.preventDefault();setSaving(true);setError('');setMessage('');
        try {
            await saveInfinitepayConfiguration({...form,...(apiKey ? {api_key:apiKey} : {})},csrf);
            setApiKey('');await refresh();setMessage('Configuração salva.');
        } catch {setApiKey('');setError('Não foi possível salvar. Confira a sessão e os requisitos de homologação.');}
        finally {setSaving(false);}
    }
    return {configuration,form,setForm,apiKey,setApiKey,available,saving,message,error,save};
}
