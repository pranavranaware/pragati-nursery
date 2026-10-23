package com.pragatinursery.common.config;

import com.pragatinursery.common.service.DevSmsServiceImpl;
import com.pragatinursery.common.service.DisabledSmsServiceImpl;
import com.pragatinursery.common.service.Msg91SmsServiceImpl;
import com.pragatinursery.common.service.SmsService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SmsConfig {

    @Bean
    @ConditionalOnProperty(name = "app.sms.provider", havingValue = "dev")
    public SmsService devSmsService() {
        return new DevSmsServiceImpl();
    }

    @Bean
    @ConditionalOnProperty(name = "app.sms.provider", havingValue = "msg91")
    public SmsService msg91SmsService() {
        return new Msg91SmsServiceImpl();
    }

    @Bean
    @ConditionalOnMissingBean(SmsService.class)
    public SmsService disabledSmsService() {
        return new DisabledSmsServiceImpl();
    }
}
