
import styles from './layout.module.css';

export default function AcompanharLayout({ children }) {
    return (
        <div className={styles.shell}>
            {children}
        </div>
    );
}
