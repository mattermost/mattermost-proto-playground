import type { ChannelWebhookPost } from '../agentsData';
import styles from './WebhookPost.module.scss';

type WebhookPostProps = {
  data: ChannelWebhookPost;
};

export default function WebhookPost({ data }: WebhookPostProps) {
  const metrics = data.fields?.filter((f) => f.short) ?? [];
  const fields = data.fields?.filter((f) => !f.short) ?? [];

  return (
    <div className={[styles['webhook-post'], styles[`webhook-post--${data.color}`]].join(' ')}>
      <div className={styles['webhook-post__inner']}>
        {(data.title || data.text) ? (
          <div className={styles['webhook-post__header']}>
            {data.title ? (
              <p className={styles['webhook-post__title']}>{data.title}</p>
            ) : null}
            {data.text ? (
              <p className={styles['webhook-post__text']}>{data.text}</p>
            ) : null}
          </div>
        ) : null}

        {metrics.length > 0 ? (
          <div className={styles['webhook-post__metrics']}>
            {metrics.map((field, i) => (
              <div key={i} className={styles['webhook-post__metric']}>
                <span className={styles['webhook-post__metric-value']}>{field.value}</span>
                <span className={styles['webhook-post__metric-label']}>{field.title}</span>
              </div>
            ))}
          </div>
        ) : null}

        {fields.length > 0 ? (
          <div className={styles['webhook-post__fields']}>
            {fields.map((field, i) => (
              <div key={i} className={styles['webhook-post__field']}>
                <span className={styles['webhook-post__field-label']}>{field.title}</span>
                <span className={styles['webhook-post__field-value']}>{field.value}</span>
              </div>
            ))}
          </div>
        ) : null}

        {data.footer ? (
          <p className={styles['webhook-post__footer']}>{data.footer}</p>
        ) : null}
      </div>
    </div>
  );
}
