import { useEffect, useMemo, useState } from "react";

import { buscarDadosDashboard } from "@/services/dashboardService.js";

import { calcularDatasPeriodo, hojeSaoPaulo } from "@/utils/dashboardDates.mjs";

export function useDashboard() {
    const hoje = useMemo(() => hojeSaoPaulo(), []);
    const [periodo, setPeriodo] = useState("hoje");
    const [dataInicioPersonalizada, setDataInicioPersonalizada] = useState(hoje);
    const [dataFimPersonalizada, setDataFimPersonalizada] = useState(hoje);
    const [dados, setDados] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState("");
    const [versaoAtualizacao, setVersaoAtualizacao] = useState(0);

    const { dataInicio, dataFim } = useMemo(
        () => calcularDatasPeriodo(periodo, dataInicioPersonalizada, dataFimPersonalizada),
        [periodo, dataInicioPersonalizada, dataFimPersonalizada]
    );

    const erroPeriodo = !dataInicio || !dataFim || dataInicio > dataFim
        ? "A data inicial não pode ser posterior à data final."
        : "";

    useEffect(() => {
        if (!dataInicio || !dataFim || dataInicio > dataFim) return undefined;

        const controller = new AbortController();
        let requisicaoAtiva = true;

        const carregar = async () => {
            setLoading(true);
            setErro("");

            try {
                const resultado = await buscarDadosDashboard({
                    dataInicio,
                    dataFim,
                    signal: controller.signal
                });

                if (requisicaoAtiva) setDados(resultado);
            } catch (error) {
                if (error.code === "ERR_CANCELED") return;

                if (requisicaoAtiva) {
                    setErro(error.response?.data?.message || "Não foi possível carregar os dados da dashboard.");
                }
            } finally {
                if (requisicaoAtiva) setLoading(false);
            }
        };

        carregar();

        return () => {
            requisicaoAtiva = false;
            controller.abort();
        };
    }, [dataInicio, dataFim, versaoAtualizacao]);

    const atualizar = () => setVersaoAtualizacao((versao) => versao + 1);

    return {
        dados,
        loading,
        erro: erroPeriodo || erro,
        periodo,
        setPeriodo,
        dataInicioPersonalizada,
        setDataInicioPersonalizada,
        dataFimPersonalizada,
        setDataFimPersonalizada,
        atualizar
    };
}
