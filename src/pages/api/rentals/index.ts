import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handleRental(req: NextApiRequest, res: NextApiResponse) {
   if (req.method === 'POST') {
      try {
         const { customerId, filmId, rentalDate, returnDate } = req.body;

         // Validation des champs
         if (!customerId || !filmId || !rentalDate || !returnDate) {
            return res.status(400).json({ error: 'Les champs customerId, filmId, rentalDate et returnDate sont requis.' });
         }

         const rentalStartDate = new Date(rentalDate);
         const rentalEndDate = new Date(returnDate);

         if (isNaN(rentalStartDate.getTime()) || isNaN(rentalEndDate.getTime())) {
            return res.status(400).json({ error: 'Le format de la date est invalide. Utilisez le format YYYY-MM-DD HH:MM:SS.' });
         }

         // Validation de la durée minimale et maximale des locations
         const minDuration = 7;
         const maxDuration = 21;
         const rentalDuration = (rentalEndDate.getTime() - rentalStartDate.getTime()) / (1000 * 60 * 60 * 24);

         if (rentalDuration < minDuration) {
            return res.status(400).json({ error: `La durée minimale d'une location est de ${minDuration} jours.` });
         }

         if (rentalDuration > maxDuration) {
            return res.status(400).json({ error: `La durée maximale d'une location est de ${maxDuration} jours.` });
         }

         // Vérifier si le film existe
         const film = await prisma.film.findUnique({
            where: { film_id: filmId },
         });

         if (!film) {
            return res.status(404).json({ error: 'Film non trouvé.' });
         }

         // Vérifier si le film est disponible dans l'inventaire
         const inventory = await prisma.inventory.findFirst({
            where: {
               film_id: film.film_id,
               rental: {
                  none: {
                     return_date: {
                        gte: rentalStartDate,
                     },
                  },
               },
            },
         });

         if (!inventory) {
            return res.status(404).json({ error: 'Film non disponible pour les dates sélectionnées.' });
         }

         // Vérifier si le client existe
         const customer = await prisma.customer.findUnique({
            where: { customer_id: customerId },
         });

         if (!customer || !customer.active) {
            return res.status(404).json({ error: 'Client non trouvé ou inactif.' });
         }


         // Créer la location
         const rental = await prisma.rental.create({
            data: {
               customer_id: customer.customer_id,
               inventory_id: inventory.inventory_id,
               rental_date: rentalStartDate,
               return_date: rentalEndDate,
               staff_id: 1,
            },
         });

         res.status(201).json({
            message: 'Location effectuée avec succès.',
            rental
         });

      } catch (error) {
         console.error(error);
         res.status(500).json({ error: 'Une erreur s\'est produite lors de la location.' });
      }
   } else {
      res.status(405).json({ error: 'Méthode HTTP non autorisée.' });
   }
}
