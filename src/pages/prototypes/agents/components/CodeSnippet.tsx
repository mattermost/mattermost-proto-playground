import styles from './CodeSnippet.module.scss';

interface CodeSnippetProps {
    lines: string[];
    startLine?: number;
}

export function CodeSnippet({ lines, startLine = 1 }: CodeSnippetProps) {
    return (
        <div className={styles['code-snippet']}>
            <div className={styles['code-snippet__gutter']}>
                {lines.map((_, i) => (
                    <div key={i} className={styles['code-snippet__line-number']}>{startLine + i}</div>
                ))}
            </div>
            <div className={styles['code-snippet__body']}>
                {lines.map((line, i) => (
                    <div key={i} className={styles['code-snippet__line']}>{line}</div>
                ))}
            </div>
        </div>
    );
}
