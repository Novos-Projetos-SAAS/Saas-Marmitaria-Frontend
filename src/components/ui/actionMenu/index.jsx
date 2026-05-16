"use client";

import Link from "next/link";

import { useState, useRef, useEffect } from "react";

import Can from "@/components/ui/can/index.jsx";

import { MoreVertical, Eye, Edit, Trash2, RotateCcw, Shield } from "lucide-react";

import styles from "./index.module.css";

export default function ActionMenu({ usuario, onArchive, onReactivate }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={styles.wrapper} ref={menuRef}>
            <button
                className={styles.menuButton}
                onClick={() => setIsOpen(!isOpen)}
                title="Ações"
            >
                <MoreVertical size={18} />
            </button>

            {isOpen && (
                <div className={styles.dropdown}>

                    <Can perform="usuarios.visualizar">
                        <Link
                            href={`/admin/usuarios/${usuario.id}?mode=view`} // Alterado usu_id para id
                            className={styles.item}
                            onClick={() => setIsOpen(false)}
                        >
                            <Eye size={16} />
                            <span>Visualizar</span>
                        </Link>
                    </Can>

                    <Can perform="usuarios.editar">
                        <Link
                            href={`/admin/usuarios/${usuario.id}?mode=edit`} // Alterado usu_id para id
                            className={styles.item}
                            onClick={() => setIsOpen(false)}
                        >
                            <Edit size={16} />
                            <span>Editar</span>
                        </Link>
                    </Can>

                    {/* Alterado usu_situacao para ativo */}
                    {usuario.ativo ? (
                        <Can perform="usuarios.inativar">
                            <button
                                className={`${styles.item} ${styles.danger}`}
                                onClick={() => {
                                    onArchive(usuario.id, usuario.nome); // Alterado usu_id/usu_nome
                                    setIsOpen(false);
                                }}
                            >
                                <Trash2 size={16} />
                                <span>Inativar</span>
                            </button>
                        </Can>
                    ) : (
                        <Can perform="usuarios.reativar">
                            <button
                                className={`${styles.item} ${styles.success}`}
                                onClick={() => {
                                    onReactivate(usuario.id, usuario.nome); // Alterado usu_id/usu_nome
                                    setIsOpen(false);
                                }}
                            >
                                <RotateCcw size={16} />
                                <span>Reativar</span>
                            </button>
                        </Can>
                    )}

                    <Can perform="permissoes.visualizar">
                        <Link
                            href={`/admin/usuarios/${usuario.id}/permissions`} // Alterado usu_id para id
                            className={styles.item}
                            style={{ color: '#8b5cf6' }}
                            onClick={() => setIsOpen(false)}
                        >
                            <Shield size={16} />
                            <span>Permissões</span>
                        </Link>
                    </Can>

                </div>
            )}
        </div>
    );
};