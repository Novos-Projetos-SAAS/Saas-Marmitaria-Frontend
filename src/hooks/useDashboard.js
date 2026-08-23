import { useEffect, useMemo, useState } from "react";

import { buscarDadosDashboard } from "@/services/dashboardService.js";

const formatarDataInput = (data) => {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
};

const adicionarDias = (data, quantidade) => {
    const novaData = new Date(data);
    novaData.setDate(novaData.getDate() + quantidade);
    return novaData;
};

const calcularDatasPeriodo = (periodo, dataInicioPersonalizada, dataFimPersonalizada) => {
    const hoje = new Date();

    if (periodo === "semana") {
        const diaSemana = hoje.getDay();
        const diferencaSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;

        return {
            dataInicio: formatarDataInput(adicionarDias(hoje, diferencaSegunda)),
            dataFim: formatarDataInput(hoje)
        };
    }

    if (periodo === "mes") {
        return {
            dataInicio: formatarDataInput(new Date(hoje.getFullYear(), hoje.getMonth(), 1)),
            dataFim: formatarDataInput(hoje)
        };
    }

    if (periodo === "personalizado") {
        return {
            dataInicio: dataInicioPersonalizada,
            dataFim: dataFimPersonalizada
        };
    }

    // Opções extras já preparadas. Para exibi-las, descomente-as em dashboardConfig.js.
    if (periodo === "ultimos7dias") {
        return {
            dataInicio: formatarDataInput(adicionarDias(hoje, -6)),
            dataFim: formatarDataInput(hoje)
        };
    }

    if (periodo === "ultimos30dias") {
        return {
            dataInicio: formatarDataInput(adicionarDias(hoje, -29)),
            dataFim: formatarDataInput(hoje)
        };
    }

    const hojeFormatado = formatarDataInput(hoje);

    return {
        dataInicio: hojeFormatado,
        dataFim: hojeFormatado
    };
};

export function useDashboard() {
    const hoje = useMemo(() => formatarDataInput(new Date()), []);
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
