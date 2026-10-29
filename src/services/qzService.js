import qz from 'qz-tray';
import api from './api';
import {createQzSecureTransport,resolveQzSigningMode} from './qzSecureTransport.mjs';

const mode=resolveQzSigningMode(process.env.NEXT_PUBLIC_QZ_SIGNING_MODE);
export const qzPrintingEnabled=mode==='secure-test';
const transport=qzPrintingEnabled?createQzSecureTransport({api,qz,
    stationId:process.env.NEXT_PUBLIC_QZ_STATION_ID,certificate:process.env.NEXT_PUBLIC_QZ_CERTIFICATE}):null;
const disabled=()=>Promise.reject(new Error('Impressão desativada nesta versão candidata.'));

export const conectarQZ=()=>transport?transport.conectarQZ():disabled();
export const desconectarQZ=()=>transport?transport.desconectarQZ():Promise.resolve();
export const imprimirCupom=(html,printer,context)=>transport?transport.imprimirCupom(html,printer,context):disabled();
