package javiertorres.backend.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * Executor dedicato alle notifiche: un picco di mail non satura il pool usato dal resto
 * dell'applicazione. La coda è limitata e la CallerRuns policy applica back-pressure
 * invece di accumulare task all'infinito.
 */
@Configuration
@EnableAsync
@EnableConfigurationProperties(MailProperties.class)
public class AsyncConfig {

    public static final String MAIL_EXECUTOR = "mailTaskExecutor";

    @Bean(name = MAIL_EXECUTOR)
    public Executor mailTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("mail-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.initialize();
        return executor;
    }
}
