import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    const hasSmtpConfig = !!(
      process.env.SMTP_HOST && 
      process.env.SMTP_PORT && 
      process.env.SMTP_USER && 
      process.env.SMTP_PASS && 
      process.env.SMTP_FROM
    );

    if (hasSmtpConfig) {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      // Verify connection
      try {
        await this.transporter.verify();
        console.log('✅ SMTP connection verified');
      } catch (error) {
        console.warn('⚠️ SMTP verification failed:', error.message);
      }
    } else {
      // Development fallback - log to console
      this.transporter = {
        sendMail: async (options) => {
          console.log('\n📧 EMAIL SENT (Development Mode)');
          console.log('To:', options.to);
          console.log('Subject:', options.subject);
          console.log('HTML:', options.html);
          console.log('Text:', options.text);
          console.log('─'.repeat(50));
          return { messageId: 'dev-mode-' + Date.now() };
        }
      };
      console.log('📧 Email service initialized in development mode');
    }

    this.initialized = true;
  }

  async sendConfirmationEmail({ to, reservation, baseUrl }) {
    await this.initialize();

    const {
      token,
      first_name,
      last_name,
      phone,
      quantity,
      comment,
      start_at,
      location,
      date
    } = reservation;

    const startDate = new Date(start_at);
    const timeString = startDate.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const modifyUrl = `${baseUrl}/r/${token}/edit`;
    const cancelUrl = `${baseUrl}/r/${token}/cancel`;

    const subject = '✅ Confirmation – Réservation jus de pomme';
    
    const textContent = `
Bonjour ${first_name},

Votre réservation a été confirmée !

📍 Détails de votre réservation :
• Lieu : ${location}
• Date : ${date}
• Heure : ${timeString}
• Nom : ${first_name} ${last_name}
• Téléphone : ${phone}
• Quantité : ${quantity}
${comment ? `• Commentaire : ${comment}` : ''}

🔗 Liens utiles :
• Modifier votre réservation : ${modifyUrl}
• Annuler votre réservation : ${cancelUrl}

Merci de soutenir les pionniers d'Ecaussinnes !

─────────────────────────────
Jus de pomme des pionniers d'Ecaussinnes
    `;

    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation de réservation</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #7B1E2B, #B23A48); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 30px; }
        .greeting { font-size: 18px; margin-bottom: 20px; color: #2c3e50; }
        .details { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .details h3 { margin-top: 0; color: #7B1E2B; font-size: 16px; }
        .detail-item { margin: 8px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .detail-item:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #555; }
        .actions { text-align: center; margin: 30px 0; }
        .btn { display: inline-block; padding: 12px 24px; margin: 0 10px; text-decoration: none; border-radius: 6px; font-weight: 600; transition: background-color 0.3s; }
        .btn-primary { background: #7B1E2B; color: white; }
        .btn-secondary { background: #6c757d; color: white; }
        .btn:hover { opacity: 0.9; }
        .footer { text-align: center; padding: 20px; background: #f8f9fa; color: #6c757d; font-size: 14px; }
        @media (max-width: 600px) {
            .btn { display: block; margin: 10px 0; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🍎 Réservation Confirmée</h1>
        </div>
        <div class="content">
            <div class="greeting">
                Bonjour <strong>${first_name}</strong>,
            </div>
            <p>Votre réservation a été confirmée avec succès ! Merci de soutenir les pionniers d'Ecaussinnes.</p>
            
            <div class="details">
                <h3>📍 Détails de votre réservation</h3>
                <div class="detail-item">
                    <span class="detail-label">Lieu :</span> ${location}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Date :</span> ${date}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Heure :</span> ${timeString}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Nom :</span> ${first_name} ${last_name}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Téléphone :</span> ${phone}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Quantité :</span> ${quantity}
                </div>
                ${comment ? `
                <div class="detail-item">
                    <span class="detail-label">Commentaire :</span> ${comment}
                </div>
                ` : ''}
            </div>

            <div class="actions">
                <a href="${modifyUrl}" class="btn btn-primary">✏️ Modifier</a>
                <a href="${cancelUrl}" class="btn btn-secondary">❌ Annuler</a>
            </div>
        </div>
        <div class="footer">
            <p><strong>Jus de pomme des pionniers d'Ecaussinnes</strong></p>
            <p>Ce message a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
    </div>
</body>
</html>
    `;

    try {
      const result = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'no-reply@example.com',
        to,
        subject,
        text: textContent,
        html: htmlContent
      });

      console.log('✅ Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();