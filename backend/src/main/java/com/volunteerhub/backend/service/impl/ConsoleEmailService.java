package com.volunteerhub.backend.service.impl;

import com.volunteerhub.backend.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Development email implementation that logs to application log.
 * Use for testing; replace with JavaMailSender for production.
 */
@Service
public class ConsoleEmailService implements EmailService {

    private final Logger logger = LoggerFactory.getLogger(ConsoleEmailService.class);

    @Override
    public void sendEmail(String to, String subject, String body) {
        logger.info("Sending email to={} subject=\"{}\" body:\n{}", to, subject, body);
    }
}
