import Can from "@/components/ui/can/index.jsx";
import AccessDenied from "@/components/ui/accessDenied/index.jsx";

import UsuarioPermissoesClient from "./usuarioPermissoesClient";

export default async function Permissoes({ params }) {

    const resolvedParams = await params;
    const userId = resolvedParams.id;

    return (
        <Can permission="permissoes.visualizar" fallback={<AccessDenied />}>
            <UsuarioPermissoesClient userId={userId} />
        </Can>
    );
}
