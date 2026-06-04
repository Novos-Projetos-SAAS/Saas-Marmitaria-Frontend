import { ChefHat } from 'lucide-react';
import styles from './emConstrucao.module.css';

export default function EmConstrucao() {
    return (
        <div className={styles.container}>
            <div className={styles.iconWrapper}>
                {/* Trocamos o ícone de construção por um chapéu de chef para dar o clima do negócio */}
                <ChefHat size={48} className={styles.icon} strokeWidth={1.5} />
            </div>
            
            <h2 className={styles.title}>Estamos a preparar algo delicioso!</h2>
            
            <p className={styles.subtitle}>
                A nossa página inicial está a receber um tempero especial. 
                Muito em breve, teremos novidades, ofertas e informativos por aqui.
            </p>

            <div className={styles.badge}>
                Em Construção 🚧
            </div>
            
            {/* FUTURAMENTE: Inserir aqui os componentes <Informativos /> ou <CarrosselOfertas /> */}
        </div>
    );
}