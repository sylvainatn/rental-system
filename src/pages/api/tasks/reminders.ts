// pages/api/tasks/reminders.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { sendMail } from '../../../mail/mail';

const prisma = new PrismaClient();

export default async function handleReminders(req: NextApiRequest, res: NextApiResponse) {

   if (req.method === 'POST') {

      const { daysBeforeReturn } = req.body;

      try {
         const targetDate = new Date();
         targetDate.setDate(targetDate.getDate() + daysBeforeReturn);

         console.log('\nDate ciblé :', targetDate);

         const rentals = await prisma.rental.findMany({
            where: {
               return_date: {
                  gte: new Date(targetDate.setHours(0, 0, 0, 0)), // Début du jour cible
                  lt: new Date(targetDate.setHours(23, 59, 59, 999)),
               },
            },
            include: {
               customer: true,
               inventory: {
                  include: { film: true },
               },
            },
         });

         console.log(`Nombre de locations trouvées : ${rentals.length}\n`);

         // Envoi des mails pour chaque clients
         for (const rental of rentals) {
            const { customer, inventory, return_date } = rental;
            const film = inventory.film;

            if (!return_date) {
               console.log(`Aucune date de retour pour la location ID : ${rental.rental_id}`);
               continue;
            }

            if (!customer.email) {
               console.log(`Client sans email (ID: ${customer.customer_id}, Nom: ${customer.first_name}). Email ignoré.`);
               continue;
            }

            const subject = `Rappel : Retour de votre film "${film.title}"`;
            const message = `Cher(e) ${customer.first_name},\n\n` +
               `Votre location du film "${film.title}" arrive à échéance le ${return_date.toDateString()}.\n` +
               `Merci de retourner le film à temps pour éviter toute pénalité.\n\n` +
               `Cordialement,\nVotre équipe de location.`;

            console.log(`Envoi de l'email à ${customer.email} pour le film "${film.title}" (Retour prévu : ${return_date.toDateString()})`);
            await sendMail(customer.email, subject, message);
         }

         res.status(200).json({
            message: `Rappels pour J-${daysBeforeReturn} envoyés.`,
            rentalsCount: rentals.length,
         });
      } catch (error) {
         console.error(error);
         res.status(500).json({ error: 'Une erreur s\'est produite lors de l\'envoi des rappels.' });
      }
   } else {
      res.status(405).json({ error: 'Méthode HTTP non autorisée.' });
   }
}
