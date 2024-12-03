import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from '../mailer/mailer';

// Instanciation de Prisma
const prisma = new PrismaClient();

// Tâche planifiée à J-5 à 12h00 avant la date de retour
cron.schedule('0 12 * * *', async () => {
   const today = new Date();
   const fiveDaysBefore = new Date(today.setDate(today.getDate() + 5));

   try {
      // Récupérer les locations dont la date de retour est dans 5 jours
      const rentals = await prisma.rental.findMany({
         where: {
            returnDate: {
               equals: fiveDaysBefore,
            },
         },
         include: {
            customer: true,  // Inclure le client pour récupérer l'e-mail
            film: true,      // Inclure le film si vous souhaitez mentionner le film dans l'e-mail
         },
      });

      // Envoyer un e-mail à chaque client
      for (const rental of rentals) {
         const emailText = `Bonjour ${rental.customer.name},\n\nLe film "${rental.film.title}" doit être retourné dans 5 jours, soit le ${rental.returnDate}. Merci de bien vouloir procéder à la restitution.\n\nCordialement, l'équipe Rental System.`;
         await sendEmail(rental.customer.email, 'Rappel : Retour de film', emailText);
      }
   } catch (error) {
      console.error('Erreur lors de l\'envoi des rappels de location:', error);
   }
});

// Tâche planifiée à J-3 à 12h00 avant la date de retour
cron.schedule('0 12 * * *', async () => {
   const today = new Date();
   const threeDaysBefore = new Date(today.setDate(today.getDate() + 3));

   try {
      // Récupérer les locations dont la date de retour est dans 3 jours
      const rentals = await prisma.rental.findMany({
         where: {
            returnDate: {
               equals: threeDaysBefore,
            },
         },
         include: {
            customer: true,  // Inclure le client pour récupérer l'e-mail
            film: true,      // Inclure le film si vous souhaitez mentionner le film dans l'e-mail
         },
      });

      // Envoyer un e-mail à chaque client
      for (const rental of rentals) {
         const emailText = `Bonjour ${rental.customer.name},\n\nLe film "${rental.film.title}" doit être retourné dans 3 jours, soit le ${rental.returnDate}. Merci de bien vouloir procéder à la restitution.\n\nCordialement, l'équipe Rental System.`;
         await sendEmail(rental.customer.email, 'Rappel : Retour de film', emailText);
      }
   } catch (error) {
      console.error('Erreur lors de l\'envoi des rappels de location:', error);
   }
});
