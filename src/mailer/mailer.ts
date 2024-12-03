import nodemailer from 'nodemailer';

// Configurez votre transporteur d'e-mails
const transporter = nodemailer.createTransport({
   service: 'gmail', // Vous pouvez utiliser un autre service comme SendGrid, Mailgun, etc.
   auth: {
      user: '',  // Remplacez par votre e-mail
      pass: 'your-email-password',  // Remplacez par votre mot de passe ou un token
   },
});

// Fonction pour envoyer l'e-mail
export const sendEmail = async (recipientEmail: string, subject: string, text: string) => {
   const mailOptions = {
      from: 'your-email@gmail.com',  // Remplacez par votre e-mail
      to: recipientEmail,
      subject: subject,
      text: text,
   };

   try {
      await transporter.sendMail(mailOptions);
      console.log('E-mail envoyé avec succès');
   } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'e-mail:', error);
   }
};
