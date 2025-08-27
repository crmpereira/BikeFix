const nodemailer = require('nodemailer');

// Configurar transporter do nodemailer
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Configuração para produção (ex: SendGrid, AWS SES, etc.)
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // Configuração para desenvolvimento (Ethereal Email)
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.EMAIL_USER || 'ethereal.user@ethereal.email',
        pass: process.env.EMAIL_PASS || 'ethereal.pass'
      }
    });
  }
};

// Templates de email
const emailTemplates = {
  verification: {
    subject: 'Verificação de Email - BikeFix',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verificação de Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚴 BikeFix</h1>
          </div>
          <div class="content">
            <h2>Olá, ${data.name}!</h2>
            <p>Obrigado por se cadastrar no BikeFix! Para ativar sua conta, clique no botão abaixo:</p>
            <a href="${data.verificationUrl}" class="button">Verificar Email</a>
            <p>Ou copie e cole este link no seu navegador:</p>
            <p><a href="${data.verificationUrl}">${data.verificationUrl}</a></p>
            <p>Este link expira em 24 horas.</p>
            <p>Se você não se cadastrou no BikeFix, ignore este email.</p>
          </div>
          <div class="footer">
            <p>© 2024 BikeFix. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: (data) => `
      Olá, ${data.name}!
      
      Obrigado por se cadastrar no BikeFix!
      
      Para ativar sua conta, acesse o link abaixo:
      ${data.verificationUrl}
      
      Este link expira em 24 horas.
      
      Se você não se cadastrou no BikeFix, ignore este email.
      
      © 2024 BikeFix
    `
  },

  resetPassword: {
    subject: 'Redefinição de Senha - BikeFix',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Redefinição de Senha</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 BikeFix</h1>
          </div>
          <div class="content">
            <h2>Olá, ${data.name}!</h2>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no BikeFix.</p>
            <a href="${data.resetUrl}" class="button">Redefinir Senha</a>
            <p>Ou copie e cole este link no seu navegador:</p>
            <p><a href="${data.resetUrl}">${data.resetUrl}</a></p>
            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul>
                <li>Este link expira em 1 hora</li>
                <li>Se você não solicitou esta redefinição, ignore este email</li>
                <li>Sua senha atual permanece inalterada até que você defina uma nova</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>© 2024 BikeFix. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: (data) => `
      Olá, ${data.name}!
      
      Recebemos uma solicitação para redefinir a senha da sua conta no BikeFix.
      
      Para redefinir sua senha, acesse o link abaixo:
      ${data.resetUrl}
      
      IMPORTANTE:
      - Este link expira em 1 hora
      - Se você não solicitou esta redefinição, ignore este email
      - Sua senha atual permanece inalterada até que você defina uma nova
      
      © 2024 BikeFix
    `
  },

  appointmentConfirmation: {
    subject: 'Agendamento Confirmado - BikeFix',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Agendamento Confirmado</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .info-box { background: white; border: 1px solid #e5e7eb; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ BikeFix</h1>
          </div>
          <div class="content">
            <h2>Agendamento Confirmado!</h2>
            <p>Olá, ${data.cyclistName}!</p>
            <p>Seu agendamento foi confirmado com sucesso:</p>
            <div class="info-box">
              <h3>Detalhes do Agendamento</h3>
              <p><strong>Oficina:</strong> ${data.workshopName}</p>
              <p><strong>Data:</strong> ${data.appointmentDate}</p>
              <p><strong>Horário:</strong> ${data.appointmentTime}</p>
              <p><strong>Serviço:</strong> ${data.serviceType}</p>
              <p><strong>Bicicleta:</strong> ${data.bikeBrand} ${data.bikeModel}</p>
            </div>
            <p>A oficina entrará em contato caso seja necessário algum serviço adicional.</p>
          </div>
          <div class="footer">
            <p>© 2024 BikeFix. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  budgetNotification: {
    subject: 'Novo Orçamento Disponível - BikeFix',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Novo Orçamento</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .info-box { background: white; border: 1px solid #e5e7eb; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 BikeFix</h1>
          </div>
          <div class="content">
            <h2>Novo Orçamento Disponível</h2>
            <p>Olá, ${data.cyclistName}!</p>
            <p>A oficina ${data.workshopName} enviou um orçamento adicional para seu agendamento:</p>
            <div class="info-box">
              <h3>Detalhes do Orçamento</h3>
              <p><strong>Valor Total:</strong> R$ ${data.totalAmount}</p>
              <p><strong>Descrição:</strong> ${data.description}</p>
            </div>
            <a href="${data.approvalUrl}" class="button">Ver Orçamento</a>
            <p>Você pode aprovar ou recusar este orçamento através do aplicativo.</p>
          </div>
          <div class="footer">
            <p>© 2024 BikeFix. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
};

// Função principal para enviar emails
const sendEmail = async ({ to, subject, template, data, html, text }) => {
  try {
    const transporter = createTransporter();

    let emailContent = {};

    if (template && emailTemplates[template]) {
      const templateData = emailTemplates[template];
      emailContent = {
        subject: subject || templateData.subject,
        html: templateData.html(data),
        text: templateData.text ? templateData.text(data) : undefined
      };
    } else {
      emailContent = {
        subject,
        html,
        text
      };
    }

    const mailOptions = {
      from: `"BikeFix" <${process.env.EMAIL_FROM || 'noreply@bikefix.com'}>`,
      to,
      ...emailContent
    };

    const result = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Email enviado:', {
        to,
        subject: emailContent.subject,
        messageId: result.messageId,
        previewUrl: nodemailer.getTestMessageUrl(result)
      });
    }

    return result;

  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    throw error;
  }
};

// Função para enviar emails em lote
const sendBulkEmail = async (emails) => {
  const results = [];
  
  for (const email of emails) {
    try {
      const result = await sendEmail(email);
      results.push({ success: true, email: email.to, result });
    } catch (error) {
      results.push({ success: false, email: email.to, error: error.message });
    }
  }
  
  return results;
};

// Função para testar configuração de email
const testEmailConfiguration = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Configuração de email válida');
    return true;
  } catch (error) {
    console.error('❌ Erro na configuração de email:', error);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendBulkEmail,
  testEmailConfiguration,
  emailTemplates
};